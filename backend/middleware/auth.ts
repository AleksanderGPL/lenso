import { db } from "@/db/index.ts";
import { userSessionsTable, usersTable } from "@/db/schema.ts";
import { deleteCookie, getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { createMiddleware } from "hono/factory";

export const authRequired = createMiddleware<{
  Variables: {
    session: InferSelectModel<typeof userSessionsTable> & {
      user: InferSelectModel<typeof usersTable>;
    };
  };
}>(async (c, next) => {
  const sessionToken = getCookie(c, "gallery_session");

  if (!sessionToken) {
    return c.json({
      message: "Session token missing.",
    }, 401);
  }

  const session = await db.query.userSessionsTable.findFirst({
    where: eq(userSessionsTable.sessionToken, sessionToken),
    with: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    deleteCookie(c, "gallery_session");
    return c.json({
      message: "Incorrect session token.",
    }, 401);
  }

  if (session.user.isBlocked) {
    return c.json({
      message: "You are blocked.",
    }, 401);
  }

  c.set("session", session);

  await next();
});

export const adminRequired = createMiddleware(async (c, next) => {
  const session = c.get("session");

  if (!session.user.isAdmin) {
    return c.json({
      message: "You do not have permission to perform this action.",
    }, 403);
  }

  await next();
});
