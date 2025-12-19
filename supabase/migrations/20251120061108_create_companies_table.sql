/*
  # Create Companies Table

  1. New Tables
    - `companies`
      - `id` (uuid, primary key) - Unique company identifier
      - `user_id` (uuid, foreign key) - Reference to auth.users
      - `name` (text) - Company name
      - `email` (text) - Company email
      - `phone` (text) - Company phone
      - `address` (text) - Company address
      - `tax_id` (text) - Tax ID / GST number
      - `currency` (text) - Default currency
      - `tax_rate` (numeric) - Default tax rate
      - `logo_url` (text) - Company logo URL
      - `website` (text) - Company website
      - `industry` (text) - Industry type
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `companies` table
    - Users can only read/update their own company

  3. Notes
    - Each user can have one company
    - Company data is used as defaults for invoices
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  tax_id text DEFAULT '',
  currency text DEFAULT 'INR - Indian Rupee',
  tax_rate numeric(5,2) DEFAULT 1,
  logo_url text DEFAULT '',
  website text DEFAULT '',
  industry text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS companies_user_id_idx ON companies(user_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own company"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);