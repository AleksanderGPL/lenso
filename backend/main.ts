import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./services/auth/index.ts";
import gallery from "./services/gallery/index.ts";
import { FRONTEND_URL } from "./utils/global.ts";

const app = new Hono();

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.route("/api/auth", auth);
app.route("/api/gallery", gallery);

Deno.serve(app.fetch);
