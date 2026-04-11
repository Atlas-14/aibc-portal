import { NextResponse } from "next/server";

const DISCORD_OPS_WEBHOOK =
  process.env.DISCORD_WEBHOOK_OPS ||
  "https://discord.com/api/webhooks/1490788770843332761/uhxv58zh5i2s6_f5FkFBXdoeHZpE5PRVwVfhlZqZnEnmdXZeyZKU3YB9RZKxwbTwygWD";

type ActivationPayload = {
  clientName?: string;
  businessName?: string;
  files?: {
    form1583?: string;
    idOne?: string;
    idTwo?: string;
  };
};

const sendDiscordAlert = async (message: string) => {
  const response = await fetch(DISCORD_OPS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActivationPayload;
    const clientName = body.clientName || "Unknown Client";
    const businessName = body.businessName || "Unknown Business";
    const files = body.files || {};

    const alertMessage =
      "🚨 **Address Activation Submission**\n" +
      `Client: ${clientName}\n` +
      `Business: ${businessName}\n` +
      `Files submitted: Form 1583 (${files.form1583 || "N/A"}), ID #1 (${files.idOne || "N/A"}), ID #2 (${files.idTwo || "N/A"})\n\n` +
      "Review in admin portal and activate the address.";

    await sendDiscordAlert(alertMessage);

    return NextResponse.json({ ok: true, status: "pending_review" });
  } catch (error) {
    console.error("Activation submission failed", error);
    return NextResponse.json({ ok: false, error: "Unable to submit activation documents." }, { status: 500 });
  }
}
