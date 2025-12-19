/*
  # Create Invoices Table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key) - Unique invoice identifier
      - `invoice_number` (text, unique) - Auto-generated invoice number
      - `company_name` (text) - Company name
      - `company_address` (text) - Company address
      - `company_email` (text) - Company email
      - `company_phone` (text) - Company phone
      - `company_tax_id` (text) - Company tax ID
      - `client_id` (uuid, foreign key) - Reference to client
      - `client_name` (text) - Client name (denormalized)
      - `client_email` (text) - Client email (denormalized)
      - `client_phone` (text) - Client phone (denormalized)
      - `client_address` (text) - Client address (denormalized)
      - `invoice_date` (date) - Invoice date
      - `due_date` (date) - Due date
      - `template_type` (text) - Template used (simple, tax, creative, receipt, premium)
      - `items` (jsonb) - Array of invoice items with description, quantity, rate, amount
      - `subtotal` (decimal) - Subtotal amount
      - `tax_amount` (decimal) - Tax amount
      - `total_amount` (decimal) - Total amount
      - `notes` (text) - Additional notes
      - `status` (text) - Invoice status (draft, sent, paid, overdue)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `invoices` table
    - Add policies for public access (demo mode)

  3. Indexes
    - Index on invoice_number for quick lookups
    - Index on status for filtering
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  company_name text NOT NULL,
  company_address text DEFAULT '',
  company_email text DEFAULT '',
  company_phone text DEFAULT '',
  company_tax_id text DEFAULT '',
  client_id uuid REFERENCES clients(id),
  client_name text NOT NULL,
  client_email text DEFAULT '',
  client_phone text DEFAULT '',
  client_address text DEFAULT '',
  invoice_date date NOT NULL,
  due_date date,
  template_type text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  notes text DEFAULT '',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(created_at DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read invoices"
  ON invoices
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update invoices"
  ON invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);