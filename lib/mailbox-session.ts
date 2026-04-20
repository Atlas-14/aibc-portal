import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { atmFetch } from "@/lib/anytime-mailbox";

export type ClientMailboxContext = {
  userId: string;
  client: {
    id: string;
    email: string;
    full_name: string;
    business_name: string | null;
    mailbox_id: string | null;
  };
  renterDetails: Record<string, unknown> | null;
  forwardAddress: {
    fullName: string;
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

function getSupabaseClients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return {
    authClient: createClient(supabaseUrl, supabaseAnonKey),
    adminClient: createClient(supabaseUrl, serviceRoleKey),
  };
}

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pickFirstString(source: Record<string, unknown> | null, keys: string[]) {
  if (!source) return "";

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

export async function getAuthenticatedMailboxContext(request: NextRequest): Promise<ClientMailboxContext> {
  const { authClient, adminClient } = getSupabaseClients();
  const accessToken = request.cookies.get("aibc_session")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(accessToken);

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const { data: clientRecord, error: clientError } = await adminClient
    .from("clients")
    .select("id, email, full_name, business_name, mailbox_id")
    .eq("user_id", user.id)
    .maybeSingle<{
      id: string;
      email: string;
      full_name: string;
      business_name: string | null;
      mailbox_id: string | null;
    }>();

  if (clientError) {
    throw new Error(clientError.message);
  }

  if (!clientRecord) {
    throw new Error("Client record not found");
  }

  let renterDetails: Record<string, unknown> | null = null;
  if (clientRecord.mailbox_id) {
    try {
      const renterResponse = await atmFetch(`/renters/${clientRecord.mailbox_id}/details`);
      renterDetails =
        typeof renterResponse === "object" && renterResponse !== null
          ? ((renterResponse as { data?: Record<string, unknown> }).data ?? (renterResponse as Record<string, unknown>))
          : null;
    } catch {
      renterDetails = null;
    }
  }

  return {
    userId: user.id,
    client: clientRecord,
    renterDetails,
    forwardAddress: {
      fullName: pickFirstString(renterDetails, ["full_name", "name"]) || toText(clientRecord.full_name),
      company: pickFirstString(renterDetails, ["company", "business_name"]) || toText(clientRecord.business_name),
      address1: pickFirstString(renterDetails, ["address_1", "address1", "street_1", "street_address", "address"]),
      address2: pickFirstString(renterDetails, ["address_2", "address2", "street_2", "address_line_2"]),
      city: pickFirstString(renterDetails, ["city"]),
      state: pickFirstString(renterDetails, ["state", "province", "region"]),
      postalCode: pickFirstString(renterDetails, ["zip", "zipcode", "postal_code", "postalCode"]),
      country: pickFirstString(renterDetails, ["country", "country_code", "country_iso"]) || "US",
    },
  };
}
