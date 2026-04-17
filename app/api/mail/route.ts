import { NextResponse } from "next/server";
import { getAnytimeMailboxOperatorId } from "@/lib/anytime-mailbox";

const MAIL_SETUP_MESSAGE = "Mail service is being configured. Your mailbox will be active within 1 business day of completing setup.";

export async function GET() {
  try {
    const operatorId = getAnytimeMailboxOperatorId();

    if (!operatorId) {
      return NextResponse.json(
        { items: [], status: "configuring", message: MAIL_SETUP_MESSAGE },
        { status: 503 },
      );
    }

    // TODO: get mailboxId from authenticated session
    // const items = await atmClient.getMailItems(mailboxId);
    return NextResponse.json({ items: [], operatorIdConfigured: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
