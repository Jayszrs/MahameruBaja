import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { closeDatabase } from "@mahameru/database";
import { allowedOrigins, config } from "./config";
import { healthRoutes } from "./routes/health";
import { leadRoutes } from "./routes/leads";

const app = Fastify({
  logger: { level: config.LOG_LEVEL },
  bodyLimit: 1_000_000,
  trustProxy: true,
});

await app.register(cors, {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Origin tidak diizinkan"), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
});
await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
await app.register(healthRoutes);
await app.register(leadRoutes);

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  const statusCode = error instanceof Error && "statusCode" in error && typeof error.statusCode === "number"
    ? error.statusCode
    : 500;
  reply.code(statusCode).send({
    error: statusCode < 500 ? "REQUEST_ERROR" : "INTERNAL_ERROR",
    message: statusCode < 500 && error instanceof Error ? error.message : "Terjadi kesalahan pada server.",
  });
});

const shutdown = async (signal: string) => {
  app.log.info({ signal }, "Shutting down");
  await app.close();
  await closeDatabase();
  process.exit(0);
};
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

await app.listen({ host: "0.0.0.0", port: config.API_PORT });
