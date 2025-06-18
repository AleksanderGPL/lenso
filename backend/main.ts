import { Hono } from "hono";
import auth from "./services/auth/index.ts";

const app = new Hono();

app.route("/api/auth", auth);

Deno.serve(app.fetch);
