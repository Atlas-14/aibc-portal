import { NextResponse } from "next/server";

// In production: get mailbox ID from session/auth, then call atmClient.getMailItems()
// For now returns empty state until Anytime Mailbox operator ID is configured

export async function GET() {
  try {
    // TODO: get mailboxId from authenticated session
    // const items = await atmClient.getMailItems(mailboxId);
    return NextResponse.json({ items: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
