-- Postgres initialization SQL for Supabase

-- Create enum types
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_enum') THEN
        CREATE TYPE role_enum AS ENUM ('manager', 'mechanic', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('pending', 'in_progress', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status_enum') THEN
        CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM ('order_created', 'order_completed', 'invoice_sent', 'invoice_paid');
    END IF;
END$$;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openId varchar(64) NOT NULL UNIQUE,
  name text,
  email varchar(320),
  phone varchar(20),
  loginMethod varchar(64),
  role role_enum NOT NULL DEFAULT 'manager',
  branchName varchar(255),
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  lastSignedIn timestamptz NOT NULL DEFAULT now()
);

-- Bike types
CREATE TABLE IF NOT EXISTS bike_types (
  id SERIAL PRIMARY KEY,
  name varchar(255) NOT NULL,
  nameEn varchar(255),
  nameFr varchar(255),
  price integer NOT NULL,
  createdBy integer NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  orderNumber varchar(50) NOT NULL UNIQUE,
  managerId integer NOT NULL,
  branchName varchar(255) NOT NULL,
  status order_status_enum NOT NULL DEFAULT 'pending',
  bikes jsonb NOT NULL,
  notes text,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  completedAt timestamptz
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoiceNumber varchar(50) NOT NULL UNIQUE,
  orderId integer NOT NULL,
  mechanicId integer NOT NULL,
  managerId integer NOT NULL,
  branchName varchar(255) NOT NULL,
  items jsonb NOT NULL,
  totalAmount integer NOT NULL,
  paymentMethod varchar(100),
  invoiceDate timestamptz NOT NULL DEFAULT now(),
  pdfUrl varchar(500),
  pdfKey varchar(255),
  status invoice_status_enum NOT NULL DEFAULT 'draft',
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipientId integer NOT NULL,
  type notification_type_enum NOT NULL,
  title varchar(255) NOT NULL,
  body text,
  relatedOrderId integer,
  relatedInvoiceId integer,
  isRead boolean NOT NULL DEFAULT false,
  createdAt timestamptz NOT NULL DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  orderId integer NOT NULL,
  bikeTypeId integer NOT NULL,
  quantity integer NOT NULL,
  completedQuantity integer NOT NULL DEFAULT 0,
  barcodes jsonb NOT NULL,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  userId integer NOT NULL,
  action varchar(100) NOT NULL,
  entityType varchar(50) NOT NULL,
  entityId integer NOT NULL,
  details jsonb,
  createdAt timestamptz NOT NULL DEFAULT now()
);
