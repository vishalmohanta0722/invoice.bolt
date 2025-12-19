/*
  # Create Clients Table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key) - Unique identifier for each client
      - `name` (text, required) - Client's full name
      - `email` (text, optional) - Client's email address
      - `phone` (text, optional) - Client's phone number
      - `address` (text, optional) - Client's physical address
      - `created_at` (timestamptz) - Timestamp when client was added
      - `updated_at` (timestamptz) - Timestamp when client was last updated

  2. Security
    - Enable RLS on `clients` table
    - Add policy for public access to read clients (for demo purposes)
    - Add policy for public access to insert clients (for demo purposes)

  3. Notes
    - This table stores all client information for invoice generation
    - All fields except name are optional to allow flexibility
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to read clients"
  ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public to insert clients"
  ON clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public to update clients"
  ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);