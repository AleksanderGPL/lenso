import { authRequired } from "@/middleware/auth.ts";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import {
  galleriesTable,
  galleryAccessKeyTable,
  galleryAccessTable,
  galleryImagesTable,
} from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import {
  createAccessKeySchema,
  createOrModifyGallerySchema,
  galleryByIdSchema,
  imageByIdSchema,
} from "@/schema/services/gallery.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { z } from "zod";
import { deleteFile, uploadFileBuffer } from "@/utils/s3.ts";
import sharp from "sharp";
import { generateUniqueAccessKey } from "@/utils/generate.ts";
import access from "./access.ts";

const app = new Hono();

app.route("/access", access);

app.get(
  "/",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const session = c.get("session");

    const galleries = await db.query.galleryAccessTable.findMany({
      with: {
        gallery: true,
      },
      where: eq(galleryAccessTable.userId, session.user.id),
      columns: {
        id: true,
      },
    });

    return c.json(galleries);
  },
);

app.get(
  "/:galleryId",
  authRequired,
  zValidator(
    "param",
    galleryByIdSchema,
  ),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");

    const gallery = await db.query.galleryAccessTable.findFirst({
      with: {
        gallery: true,
      },
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
      columns: {
        id: true,
      },
    });

    if (!gallery) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    return c.json(gallery.gallery);
  },
);

app.get(
  "/:galleryId/images",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    galleryByIdSchema,
  ),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
      with: {
        gallery: {
          with: {
            images: true,
          },
        },
      },
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    return c.json(access.gallery.images);
  },
);

app.post(
  "/:galleryId/images",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator("param", galleryByIdSchema),
  zValidator(
    "form",
    z.object({
      "images[]": z.array(
        z.instanceof(File)
          .refine(
            (file) => file.size > 0,
            "Uploaded image cannot be empty.",
          )
          .refine(
            (file) => file.type.startsWith("image/"),
            "File must be an image (e.g., image/jpeg, image/png).",
          ),
      )
        .min(1, "You must upload at least one image."),
    }),
  ),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");
    const { "images[]": images } = c.req.valid("form");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    if (!["OWNER", "EDITOR"].includes(access.accessLevel)) {
      return c.json({
        message: "You do not have permission to upload images to this gallery",
      }, 403);
    }

    for (const image of images) {
      if (!/^[a-zA-Z0-9._-]+$/.test(image.name)) {
        return c.json({
          message: `Image name ${image.name} contains invalid characters`,
        }, 400);
      }
    }

    const uploadedImages = [];

    try {
      for (const image of images) {
        const imageBuffer = await image.arrayBuffer();

        const sharpImage = sharp(imageBuffer);
        const metadata = await sharpImage.metadata();

        const [uploadedImage] = await db.insert(galleryImagesTable).values({
          galleryId,
          fileName: image.name,
          height: metadata.height,
          width: metadata.width,
        }).returning({
          id: galleryImagesTable.id,
          fileName: galleryImagesTable.fileName,
          height: galleryImagesTable.height,
          width: galleryImagesTable.width,
        });

        await uploadFileBuffer({
          buffer: new Uint8Array(imageBuffer),
          key: `gallery/${access.galleryId}/${image.name}`,
        });

        uploadedImages.push(uploadedImage);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      return c.json({
        message: "Image upload failed",
      }, 500);
    }

    return c.json(uploadedImages, 201);
  },
);

app.delete(
  "/:galleryId/images/:imageId",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    z.object({
      ...galleryByIdSchema.shape,
      ...imageByIdSchema.shape,
    }),
  ),
  async (c) => {
    const session = c.get("session");
    const { galleryId, imageId } = c.req.valid("param");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
      with: {
        gallery: {
          with: {
            images: true,
          },
        },
      },
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    if (!["OWNER", "EDITOR"].includes(access.accessLevel)) {
      return c.json({
        message:
          "You do not have permission to delete images from this gallery",
      }, 403);
    }

    if (!access.gallery.images.find((image) => image.id === imageId)) {
      return c.json({
        message: "Image not found",
      }, 404);
    }

    await deleteFile(`gallery/${galleryId}/${imageId}`);

    await db.delete(galleryImagesTable).where(
      and(
        eq(galleryImagesTable.id, imageId),
        eq(galleryImagesTable.galleryId, galleryId),
      ),
    );

    return c.json({ message: "Image deleted successfully" }, 200);
  },
);

app.post(
  "/",
  authRequired,
  zValidator("json", createOrModifyGallerySchema),
  async (c) => {
    const session = c.get("session");
    const { name, description } = c.req.valid("json");

    const [gallery] = await db.insert(galleriesTable).values({
      name,
      description,
    }).returning({
      id: galleriesTable.id,
    });

    await db.insert(galleryAccessTable).values({
      galleryId: gallery.id,
      userId: session.user.id,
      accessLevel: "OWNER",
    });

    return c.json({ message: "Gallery created successfully" }, 201);
  },
);

app.put(
  "/:galleryId",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    galleryByIdSchema,
  ),
  zValidator("json", createOrModifyGallerySchema),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");
    const { name, description } = c.req.valid("json");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    if (!["OWNER", "EDITOR"].includes(access.accessLevel)) {
      return c.json({
        message: "You do not have permission to modify this gallery",
      }, 403);
    }

    await db.update(galleriesTable).set({
      name,
      description,
    }).where(eq(galleriesTable.id, galleryId));

    return c.json({ message: "Gallery updated successfully" }, 200);
  },
);

app.post(
  "/:galleryId/accessKey",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    galleryByIdSchema,
  ),
  zValidator(
    "json",
    createAccessKeySchema,
  ),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");
    const { name, canDownload } = c.req.valid("json");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    if (!["OWNER", "EDITOR"].includes(access.accessLevel)) {
      return c.json({
        message: "You do not have permission to modify this gallery",
      }, 403);
    }

    const accessKey = await generateUniqueAccessKey();

    await db.insert(galleryAccessKeyTable).values({
      name,
      galleryId,
      accessKey,
      canDownload,
    });

    return c.json(accessKey, 201);
  },
);

app.get(
  "/:galleryId/accessKeys",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    galleryByIdSchema,
  ),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, galleryId),
      ),
    });

    if (!access) {
      return c.json({
        message: "Gallery not found",
      }, 404);
    }

    const accessKeys = await db.query.galleryAccessKeyTable.findMany({
      where: eq(galleryAccessKeyTable.galleryId, galleryId),
    });

    return c.json(accessKeys, 200);
  },
);

export default app;
