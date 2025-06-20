import { authRequired } from "@/middleware/auth.ts";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db } from "@/db/index.ts";
import { galleriesAccessTable, galleriesTable } from "@/db/schema.ts";
import { eq } from "drizzle-orm";
import { createGallerySchema } from "@/schema/services/gallery.ts";

const app = new Hono();

app.get("/", authRequired, async (c) => {
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
});

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
