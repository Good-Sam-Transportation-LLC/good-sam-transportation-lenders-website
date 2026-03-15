import { createClient } from "https://esm.sh/@supabase/supabase-js@2.99.1";

// Basic but stricter-than-includes("@") email validation to align with DB constraint
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Max length configuration aligned with DB schema:
// - full_name, firm, and investment_interest: TEXT with length CHECK <= 200 (constants below)
// - email: TEXT with length CHECK <= 320 (validated inline where used)
// - message: TEXT with length CHECK <= 2000 (validated inline where used)
const MAX_NAME_OR_FIRM_LENGTH = 200;
const MAX_INVESTMENT_INTEREST_LENGTH = 200;

const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS") ?? "";

const ALLOWED_ORIGINS = allowedOriginsEnv
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

if (!allowedOriginsEnv) {
  console.error(
    "Environment variable ALLOWED_ORIGINS is not set. No origins will be allowed. Requests will receive a configuration error response until this is configured.",
  );
} else if (ALLOWED_ORIGINS.length === 0) {
  console.error(
    "Environment variable ALLOWED_ORIGINS resolved to an empty list after parsing. Please configure at least one allowed origin. Requests will receive a configuration error response until this is corrected.",
  );
}

function getCorsHeaders(origin: string): HeadersInit {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

function createConfigErrorResponse(origin?: string | null): Response {
  const body = {
    error: "Configuration error",
    message:
      "The ALLOWED_ORIGINS environment variable is not configured correctly. Please set it to a non-empty comma-separated list of origins.",
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    // For configuration errors, reflect the request origin (when available)
    // so that browser clients can see and diagnose the misconfiguration.
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-api-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return new Response(JSON.stringify(body), {
    status: 500,
    headers,
  });
}

Deno.serve(async (req) => {
  if (ALLOWED_ORIGINS.length === 0) {
    const origin = req.headers.get("Origin");
    return createConfigErrorResponse(origin);
  }

  const origin = req.headers.get("origin") || "";
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    // Handle CORS preflight
    if (!("Access-Control-Allow-Origin" in corsHeaders)) {
      return new Response("Forbidden", { status: 403 });
    }
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Enforce origin allowlist for browser clients: reject any POST that carries a non-empty
  // Origin header that is not in the allowlist. This is a CORS control, not a security
  // boundary, and is complemented by the API key check below when configured. Requests
  // without an Origin header (e.g., server-to-server) are allowed to proceed to API key
  // validation.
  if (origin && !("Access-Control-Allow-Origin" in corsHeaders)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Required API key check for protection against automated abuse and to ensure this
  // function is not exposed with only Origin-based gating. INQUIRY_API_KEY must be set
  // in the environment, and clients must send the same value in the `x-api-key` header.
  const requiredApiKey = Deno.env.get("INQUIRY_API_KEY");
  if (!requiredApiKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: INQUIRY_API_KEY not set" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  const providedApiKey = req.headers.get("x-api-key") ?? "";
  if (providedApiKey !== requiredApiKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body: unknown = await req.json();

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Validate investment_interest after trimming (DB constraint: 1–200 chars)
    if (normalizedInvestmentInterest.length === 0) {
      return new Response(JSON.stringify({ error: "Investment interest is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (normalizedInvestmentInterest.length > MAX_INVESTMENT_INTEREST_LENGTH) {
      return new Response(JSON.stringify({ error: "Investment interest exceeds maximum length" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Service misconfigured: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing");
      return new Response(JSON.stringify({ error: "Service misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { error: insertError } = await supabase.from("investor_inquiries").insert({
      full_name: normalizedFullName,
      firm: normalizedFirm,
      email: normalizedEmail,
      investment_interest: normalizedInvestmentInterest,
      message: normalizedMessage,
    });

    if (insertError) {
      console.error("Insert error:", insertError);

      // Map common Postgres data/constraint violations to 400 so clients can fix their payload.
      // Examples:
      //  - 23514: check_violation
      //  - 23502: not_null_violation
      //  - 22001: string_data_right_truncation (value too long)
      //  - 23505: unique_violation
      const clientErrorCodes = new Set(["23514", "23502", "22001", "23505"]);
      const isClientError =
        typeof insertError.code === "string" && clientErrorCodes.has(insertError.code);

      const status = isClientError ? 400 : 500;
      const errorMessage = isClientError ? "Invalid inquiry data" : "Failed to save inquiry";

      return new Response(JSON.stringify({ error: errorMessage }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optionally "send" the investor inquiry to an external notification endpoint
    // so that this function does more than just persist the data.
    const notificationEndpoint = Deno.env.get("INVESTOR_INQUIRY_WEBHOOK_URL");

    if (notificationEndpoint) {
      try {
        const notifyResponse = await fetch(notificationEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: normalizedFullName,
            firm: normalizedFirm,
            email: normalizedEmail,
            investment_interest: normalizedInvestmentInterest,
            message: normalizedMessage,
            created_at: new Date().toISOString(),
          }),
        });

        if (!notifyResponse.ok) {
          let responseBody = "";
          try {
            responseBody = await notifyResponse.text();
          } catch {
            responseBody = "<unavailable>";
          }

          console.error(
            "Failed to send investor inquiry notification",
            notifyResponse.status,
            responseBody,
          );
        }
      } catch (notificationError) {
        console.error("Error while sending investor inquiry notification", notificationError);
      }
    }

    console.log(
      `New investor inquiry received - Interest: ${normalizedInvestmentInterest}`,
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("Invalid JSON payload:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
