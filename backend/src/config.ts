import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv({ path: new URL("../../.env", import.meta.url) });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z.string().default("info"),
  // Empty means direct connections. Configure exact proxy IPs/CIDRs when a
  // trusted reverse proxy is added; never trust forwarded headers by default.
  TRUSTED_PROXY_CIDRS: z.string().default(""),
});

export const config = envSchema.parse(process.env);
export const allowedOrigins = config.WEB_ORIGIN.split(",").map((origin) => origin.trim());
export const trustedProxies = config.TRUSTED_PROXY_CIDRS.split(",").map(value => value.trim()).filter(Boolean);
