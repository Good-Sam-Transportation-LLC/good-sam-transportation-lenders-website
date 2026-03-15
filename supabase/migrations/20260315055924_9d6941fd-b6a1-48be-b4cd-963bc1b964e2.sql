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

-- Allow inserts from authenticated and anon users
CREATE POLICY "Allow authenticated inserts"
ON public.investor_inquiries
FOR INSERT
TO authenticated, anon
WITH CHECK (
  full_name IS NOT NULL
  AND length(full_name) BETWEEN 1 AND 200
  AND email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND investment_interest IS NOT NULL
  AND length(investment_interest) BETWEEN 1 AND 200
  AND (firm IS NULL OR length(firm) <= 200)
  AND (message IS NULL OR length(message) <= 2000)
);

-- Allow inserts from anon (public) clients with the same strict checks
CREATE POLICY "Allow anon inserts"
ON public.investor_inquiries
FOR INSERT
TO anon
WITH CHECK (
  full_name IS NOT NULL
  AND length(full_name) BETWEEN 1 AND 200
  AND email IS NOT NULL
  AND length(email) BETWEEN 3 AND 320
  AND email ~* '^[^@\s]+@^[^@\s]+\.[^@\s]+$'
  AND investment_interest IS NOT NULL
  AND length(investment_interest) BETWEEN 1 AND 200
  AND (firm IS NULL OR length(firm) <= 200)
  AND (message IS NULL OR length(message) <= 2000)
);