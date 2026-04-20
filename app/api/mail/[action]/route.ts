import { NextRequest, NextResponse } from "next/server";
import { requestForward, requestOpen, requestScan, requestShred } from "@/lib/anytime-mailbox";
import { getAuthenticatedMailboxContext } from "@/lib/mailbox-session";

const MAILBOX_SETUP_MESSAGE = "Your mailbox is being set up. Mail will appear here within 1 business day of your account activation.";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ action: string }> }
) {
  try {
    const { action } = await params;
    const context = await getAuthenticatedMailboxContext(request);

    if (!context.client.mailbox_id) {
      return NextResponse.json({ error: MAILBOX_SETUP_MESSAGE }, { status: 409 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      mailPieceId?: string;
      forwardAddress?: {
        fullName?: string;
        company?: string;
        address1?: string;
        address2?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        shippingMethod?: string;
      };
    };

    if (!body.mailPieceId) {
      return NextResponse.json({ error: "mailPieceId is required" }, { status: 400 });
    }

    const renterId = context.client.mailbox_id;

    switch (action) {
      case "scan": {
        const result = await requestScan(renterId, body.mailPieceId);
        return NextResponse.json({ success: true, action, result });
      }
      case "open": {
        const result = await requestOpen(renterId, body.mailPieceId);
        return NextResponse.json({ success: true, action, result });
      }
      case "shred": {
        const result = await requestShred(renterId, body.mailPieceId);
        return NextResponse.json({ success: true, action, result });
      }
      case "forward": {
        const address = {
          ...context.forwardAddress,
          ...(body.forwardAddress ?? {}),
        };

        if (!address.address1 || !address.city || !address.state || !address.postalCode) {
          return NextResponse.json(
            { error: "Forwarding address is incomplete. Please enter street, city, state, and ZIP." },
            { status: 400 }
          );
        }

        const result = await requestForward(renterId, body.mailPieceId, address);
        return NextResponse.json({ success: true, action, result });
      }
      default:
        return NextResponse.json({ error: `Unsupported mail action: ${action}` }, { status: 404 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete mail action";
    const status = message === "Unauthorized" ? 401 : message === "Client record not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
