import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { asc, eq } from "drizzle-orm";
import { galleryAccessKeyTable, galleryImagesTable } from "@/db/schema.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { accessKeySchema } from "@/schema/services/gallery.ts";

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
              orderBy: asc(galleryImagesTable.id),
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

export default app;
