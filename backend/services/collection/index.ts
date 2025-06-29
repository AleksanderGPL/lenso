import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { and, eq } from "drizzle-orm";
import { galleryAccessTable, galleryCollectionsTable } from "@/db/schema.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { collectionByIdSchema } from "@/schema/services/gallery.ts";

const app = new Hono();

app.get(
  "/:collectionId",
  authRequired,
  zValidator(
    "param",
    collectionByIdSchema,
  ),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const session = c.get("session");
    const { collectionId } = c.req.valid("param");

    const collection = await db.query.galleryCollectionsTable.findFirst({
      where: eq(galleryCollectionsTable.id, collectionId),
      columns: {
        name: true,
        galleryId: true,
        isShared: true,
      },
      with: {
        sharedCollectionImages: {
          columns: {
            collectionId: false,
            imageId: false,
            id: false,
          },
          with: {
            image: {
              columns: {
                id: true,
                fileName: true,
                width: true,
                height: true,
              },
            },
          },
        },
        privateCollectionImages: {
          columns: {
            collectionId: false,
            imageId: false,
            id: false,
          },
          with: {
            image: {
              columns: {
                id: true,
                fileName: true,
                width: true,
                height: true,
              },
            },
          },
        },
      },
    });

    if (!collection) {
      return c.json({
        message: "Collection not found",
      }, 404);
    }

    const access = await db.query.galleryAccessTable.findFirst({
      where: and(
        eq(galleryAccessTable.userId, session.user.id),
        eq(galleryAccessTable.galleryId, collection.galleryId),
      ),
    });

    if (!access) {
      return c.json({
        message: "You do not have permission to view this collection",
      }, 403);
    }

    return c.json(collection);
  },
);

export default app;
