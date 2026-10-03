import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const leadKind = pgEnum("lead_kind", ["GENERAL", "QUOTATION", "LASER", "TRADING"]);
export const leadStatus = pgEnum("lead_status", ["BARU", "SUDAH_DIHUBUNGI", "PENAWARAN_DIKIRIM", "FOLLOW_UP", "DEAL", "BELUM_DEAL"]);
export const workflowKind = pgEnum("workflow_kind", ["TRADING", "PRODUKSI"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const businessUnits = pgTable("business_units", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 80 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 24 }),
  address: text("address"),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
}, (table) => [uniqueIndex("business_units_slug_uidx").on(table.slug)]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 180 }).notNull(),
  sku: varchar("sku", { length: 80 }),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  description: text("description"),
  specifications: jsonb("specifications").$type<Record<string, string>>().notNull().default({}),
  unit: varchar("unit", { length: 32 }),
  priceMode: varchar("price_mode", { length: 24 }).notNull().default("CONTACT"),
  price: numeric("price", { precision: 16, scale: 2 }),
  isAvailable: boolean("is_available").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(false),
  ...timestamps,
}, (table) => [uniqueIndex("products_slug_uidx").on(table.slug), index("products_category_idx").on(table.category)]);

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicId: varchar("public_id", { length: 40 }).notNull(),
  kind: leadKind("kind").notNull().default("GENERAL"),
  status: leadStatus("status").notNull().default("BARU"),
  businessUnitSlug: varchar("business_unit_slug", { length: 80 }),
  name: varchar("name", { length: 160 }).notNull(),
  company: varchar("company", { length: 200 }),
  whatsapp: varchar("whatsapp", { length: 24 }).notNull(),
  email: varchar("email", { length: 254 }),
  city: varchar("city", { length: 120 }),
  request: text("request"),
  estimate: numeric("estimate", { precision: 16, scale: 2 }),
  assignedTo: uuid("assigned_to"),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  source: varchar("source", { length: 80 }).notNull().default("WEBSITE"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps,
}, (table) => [uniqueIndex("leads_public_id_uidx").on(table.publicId), index("leads_status_idx").on(table.status), index("leads_whatsapp_idx").on(table.whatsapp)]);

export const leadItems = pgTable("lead_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  productName: varchar("product_name", { length: 200 }).notNull(),
  specification: text("specification"),
  quantity: numeric("quantity", { precision: 14, scale: 3 }),
  unit: varchar("unit", { length: 32 }),
  ...timestamps,
}, (table) => [index("lead_items_lead_idx").on(table.leadId)]);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 60 }).notNull(),
  leadId: uuid("lead_id").references(() => leads.id),
  workflow: workflowKind("workflow").notNull(),
  status: varchar("status", { length: 80 }).notNull(),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  total: numeric("total", { precision: 16, scale: 2 }),
  paymentStatus: varchar("payment_status", { length: 40 }).notNull().default("BELUM_BAYAR"),
  scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
  targetFinish: timestamp("target_finish", { withTimezone: true }),
  ...timestamps,
}, (table) => [uniqueIndex("orders_number_uidx").on(table.orderNumber), index("orders_status_idx").on(table.workflow, table.status)]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 60 }).notNull(),
  documentNumber: varchar("document_number", { length: 80 }),
  objectKey: text("object_key").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: varchar("mime_type", { length: 120 }),
  sizeBytes: integer("size_bytes"),
  ...timestamps,
}, (table) => [index("documents_order_idx").on(table.orderId), index("documents_lead_idx").on(table.leadId)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: uuid("actor_id"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("audit_entity_idx").on(table.entityType, table.entityId)]);
