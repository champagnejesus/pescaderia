import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
if (!url && process.env.NODE_ENV === "production") {
  throw new Error("TURSO_DATABASE_URL environment variable is required in production");
}

export const client = createClient({
  url: url ?? "file:./data/pescado.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
