CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE lead_kind AS ENUM ('GENERAL','QUOTATION','LASER','TRADING'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE lead_status AS ENUM ('BARU','SUDAH_DIHUBUNGI','PENAWARAN_DIKIRIM','FOLLOW_UP','DEAL','BELUM_DEAL'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE workflow_kind AS ENUM ('TRADING','PRODUKSI'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS business_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug varchar(80) NOT NULL UNIQUE,
  name varchar(160) NOT NULL, whatsapp varchar(24), address text, is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug varchar(180) NOT NULL UNIQUE, sku varchar(80), name varchar(200) NOT NULL,
  category varchar(120) NOT NULL, description text, specifications jsonb NOT NULL DEFAULT '{}'::jsonb, unit varchar(32),
  price_mode varchar(24) NOT NULL DEFAULT 'CONTACT', price numeric(16,2), is_available boolean NOT NULL DEFAULT true,
  is_published boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), public_id varchar(40) NOT NULL UNIQUE, kind lead_kind NOT NULL DEFAULT 'GENERAL',
  status lead_status NOT NULL DEFAULT 'BARU', business_unit_slug varchar(80), name varchar(160) NOT NULL, company varchar(200),
  whatsapp varchar(24) NOT NULL, email varchar(254), city varchar(120), request text, estimate numeric(16,2), assigned_to uuid,
  consent_at timestamptz, source varchar(80) NOT NULL DEFAULT 'WEBSITE', metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_whatsapp_idx ON leads(whatsapp);
CREATE TABLE IF NOT EXISTS lead_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  product_name varchar(200) NOT NULL, specification text, quantity numeric(14,3), unit varchar(32),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_items_lead_idx ON lead_items(lead_id);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_number varchar(60) NOT NULL UNIQUE, lead_id uuid REFERENCES leads(id),
  workflow workflow_kind NOT NULL, status varchar(80) NOT NULL, customer_name varchar(200) NOT NULL, total numeric(16,2),
  payment_status varchar(40) NOT NULL DEFAULT 'BELUM_BAYAR', scheduled_start timestamptz, target_finish timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(workflow,status);
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE, type varchar(60) NOT NULL, document_number varchar(80),
  object_key text NOT NULL, original_name text NOT NULL, mime_type varchar(120), size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS documents_order_idx ON documents(order_id);
CREATE INDEX IF NOT EXISTS documents_lead_idx ON documents(lead_id);
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid, action varchar(100) NOT NULL, entity_type varchar(80) NOT NULL,
  entity_id uuid, before jsonb, after jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON audit_logs(entity_type,entity_id);
