import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { getDatabase, leadItems, leads } from "@mahameru/database";

const leadInput = z.object({
  kind: z.enum(["GENERAL", "QUOTATION", "LASER", "TRADING"]).default("GENERAL"),
  businessUnitSlug: z.string().max(80).optional(),
  name: z.string().trim().min(2).max(160),
  company: z.string().trim().max(200).optional(),
  whatsapp: z.string().trim().min(8).max(24).regex(/^[+0-9\s()-]+$/),
  email: z.string().email().max(254).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional(),
  request: z.string().trim().max(5000).optional(),
  consent: z.literal(true),
  source: z.string().max(80).default("WEBSITE"),
  metadata: z.record(z.unknown()).optional(),
  items: z.array(z.object({
    productName: z.string().trim().min(1).max(200),
    specification: z.string().trim().max(1000).optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().trim().max(32).optional(),
  })).max(50).default([]),
});

function makePublicId() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `LEAD-${date}-${suffix}`;
}

export const leadRoutes: FastifyPluginAsync = async (app) => {
  app.post("/api/v1/leads", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
  }, async (request, reply) => {
    const parsed = leadInput.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(422).send({
        error: "VALIDATION_ERROR",
        message: "Data permintaan belum lengkap atau tidak valid.",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const input = parsed.data;
    const publicId = makePublicId();
    const result = await getDatabase().transaction(async (tx) => {
      const [lead] = await tx.insert(leads).values({
        publicId,
        kind: input.kind,
        businessUnitSlug: input.businessUnitSlug,
        name: input.name,
        company: input.company || null,
        whatsapp: input.whatsapp,
        email: input.email || null,
        city: input.city || null,
        request: input.request || null,
        consentAt: new Date(),
        source: input.source,
        metadata: input.metadata ?? {},
      }).returning({ id: leads.id, publicId: leads.publicId, status: leads.status });

      if (input.items.length) {
        await tx.insert(leadItems).values(input.items.map((item) => ({
          leadId: lead.id,
          productName: item.productName,
          specification: item.specification || null,
          quantity: item.quantity?.toString(),
          unit: item.unit || null,
        })));
      }
      return lead;
    });

    request.log.info({ leadId: result.id, publicId }, "Lead created");
    return reply.code(201).send({ data: { id: result.publicId, status: result.status } });
  });
};
