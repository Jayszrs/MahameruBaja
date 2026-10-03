import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL wajib diisi");
  if (!client) client = postgres(url, { max: 10, idle_timeout: 20 });
  if (!database) database = drizzle(client, { schema });
  return database;
}

export async function closeDatabase() {
  if (client) await client.end();
  client = undefined;
  database = undefined;
}

export * from "./schema";
