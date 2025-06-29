import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  galleryAccessKeyTable,
  galleryAccessTable,
  galleryCollectionsTable,
  galleryPrivateCollectionsImagesTable,
} from "@/db/schema.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { collectionByIdSchema } from "@/schema/services/gallery.ts";
import { z } from "zod";

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

    let accessKeys: { id: number; name: string }[] = [];
    if (!collection.isShared) {
      accessKeys = await db.select({
        id: galleryAccessKeyTable.id,
        name: galleryAccessKeyTable.name,
        imageCount:
          sql`COUNT(${galleryPrivateCollectionsImagesTable.imageId}) FILTER (WHERE ${galleryPrivateCollectionsImagesTable.collectionId} = ${collectionId})`,
      }).from(galleryAccessKeyTable).where(
        and(
          eq(galleryAccessKeyTable.galleryId, collection.galleryId),
          eq(galleryAccessKeyTable.canUseCollections, true),
        ),
      ).leftJoin(
        galleryPrivateCollectionsImagesTable,
        eq(
          galleryPrivateCollectionsImagesTable.accessId,
          galleryAccessKeyTable.id,
        ),
      ).groupBy(galleryAccessKeyTable.id).orderBy(
        desc(galleryAccessKeyTable.id),
      );
    }

    return c.json({
      ...collection,
      accessKeys: accessKeys.length > 0 ? accessKeys : undefined,
    });
  },
);

app.get(
  "/:collectionId/access/:accessId",
  authRequired,
  zValidator(
    "param",
    z.object({
      ...collectionByIdSchema.shape,
      accessId: z.coerce.number(),
    }),
  ),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const session = c.get("session");
    const { collectionId, accessId } = c.req.valid("param");

    const collection = await db.query.galleryCollectionsTable.findFirst({
      where: eq(galleryCollectionsTable.id, collectionId),
      columns: {
        name: true,
        galleryId: true,
        isShared: true,
      },
      with: {
        privateCollectionImages: {
          where: eq(galleryPrivateCollectionsImagesTable.accessId, accessId),
          columns: {
            accessId: false,
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

    const accessKey = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.id, accessId),
      columns: {
        name: true,
      },
    });

    return c.json({
      ...collection,
      accessKey,
    });
  },
);

app.delete(
  "/:collectionId",
  authRequired,
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  zValidator("param", collectionByIdSchema),
  async (c) => {
    const session = c.get("session");
    const { collectionId } = c.req.valid("param");

    const collection = await db.query.galleryCollectionsTable.findFirst({
      where: eq(galleryCollectionsTable.id, collectionId),
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
        message: "You do not have permission to delete this collection",
      }, 403);
    }

    await db.delete(galleryCollectionsTable).where(
      eq(galleryCollectionsTable.id, collectionId),
    );

    return c.json({ message: "Collection deleted successfully" }, 200);
  },
);

export default app;
