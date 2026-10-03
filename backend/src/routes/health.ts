import type { FastifyPluginAsync } from "fastify";
import { sql } from "drizzle-orm";
import { getDatabase } from "@mahameru/database";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async (_request, reply) => {
    try {
      await getDatabase().execute(sql`select 1`);
      return { status: "ok", database: "up", timestamp: new Date().toISOString() };
    } catch (error) {
      app.log.error(error, "Database health check failed");
      return reply.code(503).send({ status: "degraded", database: "down" });
    }
  });
};
