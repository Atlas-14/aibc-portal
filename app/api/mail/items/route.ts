import { NextRequest, NextResponse } from "next/server";
import { getMailItems } from "@/lib/anytime-mailbox";
import { getAuthenticatedMailboxContext } from "@/lib/mailbox-session";

const MAILBOX_SETUP_MESSAGE = "Your mailbox is being set up. Mail will appear here within 1 business day of your account activation.";

type RawMailItem = Record<string, unknown>;

function stringValue(item: RawMailItem, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function normalizeStatus(item: RawMailItem) {
  const raw = stringValue(item, ["status", "mail_status", "state", "request_status"]).toLowerCase();
  const flags = {
    forwarded: Boolean(item.forwarded_at || item.forward_request_id || item.forward_status),
    shredded: Boolean(item.shredded_at || item.shred_request_id || item.shred_status),
    scanned: Boolean(item.scan_url || item.scan_file || item.scan_status || item.scanned_at),
    opened: Boolean(item.opened_at || item.open_request_id || item.open_status),
  };

  if (raw.includes("shred") || flags.shredded) return "shredded";
  if (raw.includes("forward") || flags.forwarded) return "forwarded";
  if (raw.includes("scan") || flags.scanned) return "scanned";
  if (raw.includes("open") || flags.opened) return "opened";
  return raw || "new";
}

function normalizeMailItem(item: RawMailItem) {
  const imageUrl = stringValue(item, ["image_url", "thumbnail_url", "photo_url", "front_image_url", "mail_image_url"]);
  const scanUrl = stringValue(item, ["scan_url", "download_url", "file_url", "scan_file_url"]);

  return {
    id: stringValue(item, ["id", "mail_piece_id", "mail_id"]),
    sender: stringValue(item, ["sender", "sender_name", "from_name", "from"]),
    receivedAt: stringValue(item, ["received_at", "date_received", "created_at", "delivered_at"]),
    type: stringValue(item, ["mail_type", "item_type", "type", "piece_type"]) || "Mail",
    status: normalizeStatus(item),
    imageUrl: imageUrl || null,
    scanUrl: scanUrl || null,
    trackingNumber: stringValue(item, ["tracking_number", "tracking"]),
    notes: stringValue(item, ["notes", "description"]),
    raw: item,
  };
}

export async function GET(request: NextRequest) {
  try {
    const context = await getAuthenticatedMailboxContext(request);

    if (!context.client.mailbox_id) {
      return NextResponse.json({
        mailboxReady: false,
        message: MAILBOX_SETUP_MESSAGE,
        unreadCount: 0,
        items: [],
        forwardAddress: context.forwardAddress,
      });
    }

    const items = await getMailItems(context.client.mailbox_id);
    const normalizedItems = items.map(normalizeMailItem).filter((item) => item.id);
    const unreadCount = normalizedItems.filter((item) => item.status === "new").length;

    return NextResponse.json({
      mailboxReady: true,
      unreadCount,
      items: normalizedItems,
      forwardAddress: context.forwardAddress,
      client: {
        id: context.client.id,
        fullName: context.client.full_name,
        businessName: context.client.business_name,
        email: context.client.email,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load mail";
    const status = message === "Unauthorized" ? 401 : message === "Client record not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
