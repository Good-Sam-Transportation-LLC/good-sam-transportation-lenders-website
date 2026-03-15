import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

// Basic but stricter-than-includes("@") email validation to align with DB constraint
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Max length constants aligned with DB schema:
// - full_name and firm: VARCHAR(200)
// - email: VARCHAR(320)
// - message: VARCHAR(2000)
const MAX_NAME_OR_FIRM_LENGTH = 200;
const MAX_EMAIL_LENGTH = 320;
const MAX_MESSAGE_LENGTH = 2000;

function getCorsHeaders(origin: string): HeadersInit {
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  const allowedOrigins = allowedOriginsEnv
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0);

  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-investor-inquiry-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    // Handle CORS preflight
    if (!("Access-Control-Allow-Origin" in corsHeaders)) {
      return new Response("Forbidden", { status: 403 });
    }
    return new Response(null, { headers: corsHeaders });
  }

  // Note: Do not use CORS headers / Origin as an authentication or authorization mechanism.
  // CORS is enforced by browsers; non-browser clients may legitimately call this endpoint.


  // Simple abuse control: shared secret header check (mandatory)
  const expectedSecret = Deno.env.get("INVESTOR_INQUIRY_SECRET");
  if (!expectedSecret) {
    console.error("INVESTOR_INQUIRY_SECRET is not configured; refusing to process request.");
    return new Response(JSON.stringify({ error: "Service misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const providedSecret = req.headers.get("x-investor-inquiry-secret");
  if (providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Invalid JSON payload:", err);
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { full_name, firm, email, investment_interest, message } = body as {
      full_name?: unknown;
      firm?: unknown;
      email?: unknown;
      investment_interest?: unknown;
      message?: unknown;
    };

    // Validate required fields and normalize values
    if (!full_name || typeof full_name !== "string" || full_name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Full name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!investment_interest || typeof investment_interest !== "string") {
      return new Response(JSON.stringify({ error: "Investment interest is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedFullName = full_name.trim();
    const normalizedFirm =
      typeof firm === "string" && firm.trim().length > 0 ? firm.trim() : null;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedInvestmentInterest = investment_interest.trim();
    const normalizedMessage =
      typeof message === "string" && message.trim().length > 0 ? message.trim() : null;

    // Length validation aligned with DB constraints:
    // full_name/firm up to 200, email up to 320, message up to 2000
    if (normalizedFullName.length > MAX_NAME_OR_FIRM_LENGTH) {
      return new Response(JSON.stringify({ error: "Full name exceeds maximum length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (normalizedFirm && normalizedFirm.length > MAX_NAME_OR_FIRM_LENGTH) {
      return new Response(JSON.stringify({ error: "Firm exceeds maximum length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (normalizedEmail.length === 0 || normalizedEmail.length > 320 || !emailRegex.test(normalizedEmail)) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (normalizedMessage && normalizedMessage.length > 2000) {
      return new Response(JSON.stringify({ error: "Message exceeds maximum length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase.from("investor_inquiries").insert({
      full_name: normalizedFullName,
      firm: normalizedFirm,
      email: normalizedEmail,
      investment_interest: normalizedInvestmentInterest,
      message: normalizedMessage,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save inquiry" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(
      `New investor inquiry from ${normalizedFullName} (${normalizedEmail}) - Interest: ${normalizedInvestmentInterest}`,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
