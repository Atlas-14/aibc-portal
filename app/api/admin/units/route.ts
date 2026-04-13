import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("unit_number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    units: (data ?? []).map(u => ({
      id: u.id,
      unitNumber: u.unit_number,
      status: u.status,
      ownerName: u.owner_name,
      ownerEmail: u.owner_email,
      salePrice: u.sale_price,
      downPayment: u.down_payment,
      financingTermMonths: u.financing_term_months,
      notes: u.notes,
      assignedAt: u.assigned_at,
    })),
  });
}
