import { authRequired } from "@/middleware/auth.ts";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { galleriesAccessTable, galleriesTable } from "@/db/schema.ts";
import { and, eq } from "drizzle-orm";
import { createGallerySchema } from "@/schema/services/gallery.ts";
import { rateLimit } from "@/middleware/ratelimit.ts";
import { z } from "zod";

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

    const galleries = await db.query.galleriesAccessTable.findMany({
      with: {
        gallery: true,
      },
      where: eq(galleriesAccessTable.userId, session.user.id),
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
    z.object({
      galleryId: z.string().refine(
        (value) => !isNaN(Number(value)),
        "galleryId must be a valid number",
      ).transform((value) => Number(value)),
    }),
  ),
  rateLimit({
    windowMs: 60 * 1000,
    limit: 50,
  }),
  async (c) => {
    const session = c.get("session");
    const { galleryId } = c.req.valid("param");

    const gallery = await db.query.galleriesAccessTable.findFirst({
      with: {
        gallery: true,
      },
      where: and(
        eq(galleriesAccessTable.userId, session.user.id),
        eq(galleriesAccessTable.galleryId, galleryId),
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

    await db.insert(galleriesAccessTable).values({
      galleryId: gallery.id,
      userId: session.user.id,
      accessLevel: "OWNER",
    });

    return c.json({ message: "Gallery created successfully" }, 201);
  },
);

export default app;
