import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: new URL("../../.env", import.meta.url) });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.string().default("info"),
});

export const config = envSchema.parse(process.env);
export const allowedOrigins = config.WEB_ORIGIN.split(",").map((origin) => origin.trim());
