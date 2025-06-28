import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { and, asc, eq } from "drizzle-orm";
import {
  galleryAccessKeyTable,
  galleryCollectionsImagesTable,
  galleryCollectionsTable,
  galleryImagesTable,
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
  zValidator("param", accessKeySchema),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const { accessKey } = c.req.valid("param");

    const access = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.accessKey, accessKey),
      columns: {
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
                collections: {
                  columns: {
                    collectionId: true,
                  },
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

    return c.json(access);
  },
);

app.post(
  "/:accessKey/collection/:collectionId",
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
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
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

    const existingImage = await db.query.galleryCollectionsImagesTable
      .findFirst({
        where: and(
          eq(galleryCollectionsImagesTable.imageId, imageId),
          eq(galleryCollectionsImagesTable.collectionId, collectionId),
        ),
      });

    if (existingImage) {
      return c.json({
        message: "This image is already in this collection",
      }, 400);
    }

    await db.insert(galleryCollectionsImagesTable).values({
      collectionId,
      imageId,
    });

    return c.json({ message: "Image added to collection" }, 200);
  },
);

export default app;
