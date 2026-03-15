

## Plan: Connect Backend for Contact Form (Database + Email)

This requires enabling **Lovable Cloud** to get a Supabase backend for database storage and email sending.

### 1. Enable Lovable Cloud
- Spin up the backend infrastructure (Supabase database + edge functions)

### 2. Create Database Table
- Migration to create `investor_inquiries` table:
  - `id` (uuid, PK)
  - `full_name` (text, not null)
  - `firm` (text, nullable)
  - `email` (text, not null)
  - `investment_interest` (text, not null)
  - `message` (text, nullable)
  - `created_at` (timestamptz, default now())
- Enable RLS with an insert-only policy for anonymous users (no auth required for public form)

### 3. Create Edge Function for Email Notification
- `supabase/functions/send-investor-inquiry/index.ts`
- Accepts the form data, inserts into `investor_inquiries` table, and sends a notification email to your investor relations inbox using Supabase's built-in email capabilities
- Includes CORS headers and input validation (zod)

### 4. Update ContactSection.tsx
- Replace the dummy `handleSubmit` with a real submission flow:
  - Add loading state and error handling with toast notifications
  - Call the edge function via `supabase.functions.invoke('send-investor-inquiry', { body: formData })`
  - Show success state on completion, error toast on failure
- Use controlled form inputs with React state

### 5. Wire Up Supabase Client
- Generate `src/integrations/supabase/client.ts` and types from the Lovable Cloud connection

### Technical Notes
- The form collects: name, firm, email, investment interest, message
- Email will be sent to an address you specify (I'll ask during implementation)
- RLS policy allows public inserts but no reads — only you can view submissions via the Supabase dashboard

