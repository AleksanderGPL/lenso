import { authRequired } from "@/middleware/auth.ts";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import {
  galleriesTable,
  galleryAccessTable,
  galleryImagesTable,
} from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import {
  createGallerySchema,
  galleryByIdSchema,
} from "@/schema/services/gallery.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { z } from "zod";
import { uploadFileBuffer } from "@/utils/s3.ts";
import sharp from "sharp";

const app = new Hono();

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

    try {
      for (const image of images) {
        const imageBuffer = await image.arrayBuffer();

        await uploadFileBuffer({
          buffer: new Uint8Array(imageBuffer),
          key: `gallery/${access.galleryId}/${image.name}`,
        });

        const sharpImage = sharp(imageBuffer);
        const metadata = await sharpImage.metadata();

        await db.insert(galleryImagesTable).values({
          galleryId,
          fileName: image.name,
          height: metadata.height,
          width: metadata.width,
        });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      return c.json({
        message: "Image upload failed",
      }, 500);
    }

    return c.json({ message: "Images uploaded successfully" }, 201);
  },
);

app.post(
  "/",
  authRequired,
  zValidator("json", createGallerySchema),
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

export default app;
