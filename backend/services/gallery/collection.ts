import { Hono } from "hono";
import { authRequired } from "@/middleware/auth.ts";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { galleryAccessTable, galleryCollectionsTable } from "@/db/schema.ts";
import { and, asc, eq } from "drizzle-orm";
import {
  createCollectionSchema,
  galleryByIdSchema,
} from "@/schema/services/gallery.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";

export function registerRoutes(app: Hono) {
  app.get(
    "/:galleryId/collections",
    authRequired,
    rateLimit({
      windowMs: 60 * 1000,
      limit: 50,
    }),
    zValidator("param", galleryByIdSchema),
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
              collections: {
                orderBy: asc(galleryCollectionsTable.id),
              },
            },
          },
        },
      });

      if (!access) {
        return c.json({
          message: "Gallery not found",
        }, 404);
      }

      return c.json(access.gallery.collections);
    },
  );

  app.post(
    "/:galleryId/collection",
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
      createCollectionSchema,
    ),
    async (c) => {
      const session = c.get("session");
      const { galleryId } = c.req.valid("param");
      const { name, isShared } = c.req.valid("json");

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

      const [collection] = await db.insert(galleryCollectionsTable).values({
        galleryId,
        name,
        isShared,
      }).returning();

      return c.json(collection, 201);
    },
  );
}

export default registerRoutes;
