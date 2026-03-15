-- Create investor_inquiries table
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.investor_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL
    CHECK (length(full_name) BETWEEN 1 AND 200),
  firm TEXT
    CHECK (firm IS NULL OR length(firm) <= 200),
  email TEXT NOT NULL
    CHECK (
      length(email) BETWEEN 3 AND 320
      AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    ),
  investment_interest TEXT NOT NULL
    CHECK (length(investment_interest) BETWEEN 1 AND 200),
  message TEXT
    CHECK (message IS NULL OR length(message) <= 2000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow insert-only access for authenticated users
CREATE POLICY investor_inquiries_insert_authenticated
  ON public.investor_inquiries
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anonymous insert policy intentionally omitted.
-- Public form submissions should be handled via a secure backend
-- (e.g., edge function using the service-role key) rather than
-- granting direct insert privileges to the anon role.