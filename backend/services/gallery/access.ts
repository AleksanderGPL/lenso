import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { and, asc, eq } from "drizzle-orm";
import {
  galleryAccessKeyTable,
  galleryCollectionsTable,
  galleryImagesTable,
  galleryPrivateCollectionsImagesTable,
  gallerySharedCollectionsImagesTable,
} from "@/db/schema.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import {
  accessKeySchema,
  collectionByIdSchema,
} from "@/schema/services/gallery.ts";
import { z } from "zod";

const app = new Hono();

app.get(
  "/:accessKey",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator("param", accessKeySchema),
  async (c) => {
    const { accessKey } = c.req.valid("param");

    const access = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.accessKey, accessKey),
      columns: {
        id: true,
        canDownload: true,
        canUseCollections: true,
      },
      with: {
        gallery: {
          with: {
            images: {
              columns: {
                id: true,
                fileName: true,
                height: true,
                width: true,
              },
              with: {
                sharedCollections: {
                  columns: {
                    collectionId: true,
                  },
                  orderBy: asc(galleryCollectionsTable.id),
                },
              },
              orderBy: asc(galleryImagesTable.id),
            },
            collections: {
              columns: {
                id: true,
                name: true,
                isShared: true,
              },
              orderBy: asc(galleryCollectionsTable.id),
            },
          },
          columns: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!access) {
      return c.json({
        message: "Access key not found",
      }, 404);
    }

    const privateCollections = await db.query
      .galleryPrivateCollectionsImagesTable.findMany({
        where: eq(galleryPrivateCollectionsImagesTable.accessId, access.id),
        columns: {
          imageId: true,
          collectionId: true,
        },
        orderBy: asc(galleryPrivateCollectionsImagesTable.collectionId),
      });

    const privateCollectionsMap = new Map<
      number,
      Array<{ collectionId: number }>
    >();
    privateCollections.forEach((pc) => {
      if (!privateCollectionsMap.has(pc.imageId)) {
        privateCollectionsMap.set(pc.imageId, []);
      }
      privateCollectionsMap.get(pc.imageId)?.push({
        collectionId: pc.collectionId,
      });
    });

    if (access.gallery.images) {
      access.gallery.images = access.gallery.images.map((image) => ({
        ...image,
        privateCollections: privateCollectionsMap.get(image.id) || [],
      }));
    }

    return c.json(access);
  },
);

app.post(
  "/:accessKey/collection/:collectionId",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    z.object({
      ...accessKeySchema.shape,
      ...collectionByIdSchema.shape,
    }),
  ),
  zValidator(
    "json",
    z.object({
      imageId: z.number(),
    }),
  ),
  async (c) => {
    const { accessKey, collectionId } = c.req.valid("param");
    const { imageId } = c.req.valid("json");

    const access = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.accessKey, accessKey),
    });

    if (!access) {
      return c.json({
        message: "Access key not found",
      }, 404);
    }

    if (!access.canUseCollections) {
      return c.json({
        message: "You do not have permission to use collections",
      }, 403);
    }

    const collection = await db.query.galleryCollectionsTable.findFirst({
      where: eq(galleryCollectionsTable.id, collectionId),
    });

    if (!collection) {
      return c.json({
        message: "Collection not found",
      }, 404);
    }

    if (collection.galleryId !== access.galleryId) {
      return c.json({
        message: "You do not have permission to use this collection",
      }, 403);
    }

    const image = await db.query.galleryImagesTable.findFirst({
      where: and(
        eq(galleryImagesTable.id, imageId),
        eq(galleryImagesTable.galleryId, access.galleryId),
      ),
    });

    if (!image) {
      return c.json({
        message: "Image not found",
      }, 404);
    }

    if (collection.isShared) {
      const existingImage = await db.query.gallerySharedCollectionsImagesTable
        .findFirst({
          where: and(
            eq(gallerySharedCollectionsImagesTable.imageId, imageId),
            eq(gallerySharedCollectionsImagesTable.collectionId, collectionId),
          ),
        });

      if (existingImage) {
        return c.json({
          message: "This image is already in this collection",
        }, 400);
      }

      await db.insert(gallerySharedCollectionsImagesTable).values({
        collectionId,
        imageId,
      });
    } else {
      const existingImage = await db.query.galleryPrivateCollectionsImagesTable
        .findFirst({
          where: and(
            eq(galleryPrivateCollectionsImagesTable.imageId, imageId),
            eq(galleryPrivateCollectionsImagesTable.collectionId, collectionId),
            eq(galleryPrivateCollectionsImagesTable.accessId, access.id),
          ),
        });

      if (existingImage) {
        return c.json({
          message: "This image is already in this collection",
        }, 400);
      }

      await db.insert(galleryPrivateCollectionsImagesTable).values({
        collectionId,
        imageId,
        accessId: access.id,
      });
    }

    return c.json({ message: "Image added to collection" }, 200);
  },
);

app.delete(
  "/:accessKey/collection/:collectionId",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator(
    "param",
    z.object({
      ...accessKeySchema.shape,
      ...collectionByIdSchema.shape,
    }),
  ),
  zValidator(
    "json",
    z.object({
      imageId: z.number(),
    }),
  ),
  async (c) => {
    const { accessKey, collectionId } = c.req.valid("param");
    const { imageId } = c.req.valid("json");

    const access = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.accessKey, accessKey),
    });

    if (!access) {
      return c.json({
        message: "Access key not found",
      }, 404);
    }

    if (!access.canUseCollections) {
      return c.json({
        message: "You do not have permission to use collections",
      }, 403);
    }

    const collection = await db.query.galleryCollectionsTable.findFirst({
      where: eq(galleryCollectionsTable.id, collectionId),
    });

    if (!collection) {
      return c.json({
        message: "Collection not found",
      }, 404);
    }

    if (collection.galleryId !== access.galleryId) {
      return c.json({
        message: "You do not have permission to use this collection",
      }, 403);
    }

    if (collection.isShared) {
      await db.delete(gallerySharedCollectionsImagesTable).where(and(
        eq(gallerySharedCollectionsImagesTable.imageId, imageId),
        eq(gallerySharedCollectionsImagesTable.collectionId, collectionId),
      ));
    } else {
      await db.delete(galleryPrivateCollectionsImagesTable).where(and(
        eq(galleryPrivateCollectionsImagesTable.imageId, imageId),
        eq(galleryPrivateCollectionsImagesTable.collectionId, collectionId),
        eq(galleryPrivateCollectionsImagesTable.accessId, access.id),
      ));
    }

    return c.json({ message: "Image removed from collection" }, 200);
  },
);

export default app;
