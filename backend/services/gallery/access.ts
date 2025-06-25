import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { asc, eq } from "drizzle-orm";
import { galleryAccessKeyTable, galleryImagesTable } from "@/db/schema.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { accessKeySchema } from "@/schema/services/gallery.ts";
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
              orderBy: asc(galleryImagesTable.id),
              limit: 50,
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

app.get(
  "/:accessKey/images",
  zValidator("param", accessKeySchema),
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().min(1).max(50).optional(),
      offset: z.coerce.number().min(0).optional(),
    }),
  ),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const { accessKey } = c.req.valid("param");
    const { limit, offset } = c.req.valid("query");

    const access = await db.query.galleryAccessKeyTable.findFirst({
      where: eq(galleryAccessKeyTable.accessKey, accessKey),
    });

    if (!access) {
      return c.json({
        message: "Access key not found",
      }, 404);
    }

    const images = await db.query.galleryImagesTable.findMany({
      where: eq(galleryImagesTable.galleryId, access.galleryId),
      columns: {
        id: true,
        fileName: true,
        height: true,
        width: true,
      },
      orderBy: asc(galleryImagesTable.id),
      limit,
      offset,
    });

    return c.json(images);
  },
);

export default app;
