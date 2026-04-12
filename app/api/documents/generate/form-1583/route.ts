import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const NAVY = rgb(0.051, 0.165, 0.290);    // #0D2A4A
const TEAL = rgb(0.212, 0.918, 0.918);    // #36EAEA
const BLACK = rgb(0, 0, 0);
const RED = rgb(0.8, 0.1, 0.1);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientName = searchParams.get("name") || "Ricky Kinney";
  const businessName = searchParams.get("business") || "AI Business Centers LLC";

  try {
    // Load the official USPS Form 1583
    const formPath = path.join(process.cwd(), "public", "form-1583-official.pdf");
    const existingPdfBytes = fs.readFileSync(formPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const page1 = pages[0];
    const { height } = page1.getSize();

    // Helper to draw text at PDF coordinates (y from bottom)
    const drawText = (
      page: typeof page1,
      text: string,
      x: number,
      yFromTop: number,
      opts: { size?: number; font?: typeof helvetica; color?: ReturnType<typeof rgb> } = {}
    ) => {
      page.drawText(text, {
        x,
        y: height - yFromTop,
        size: opts.size ?? 9,
        font: opts.font ?? helvetica,
        color: opts.color ?? NAVY,
      });
    };

    // ── PAGE 1 OVERLAYS ──────────────────────────────────────────────
    // These coordinates are approximate for PS Form 1583.
    // The form has: applicant info on top half, agent info below.

    // Applicant name (Item 1)
    drawText(page1, clientName, 72, 200, { font: helveticaBold, size: 10 });

    // Business name (Item 2 / DBA)
    drawText(page1, businessName, 72, 225, { size: 9 });

    // Agent name (Item 6 - Authorized Agent)
    drawText(page1, "AI Business Centers LLC", 72, 380, { font: helveticaBold, size: 9 });

    // Agent address (Item 7)
    drawText(page1, "125 N 9th Street", 72, 400, { size: 9 });
    drawText(page1, "Frederick, Oklahoma 73542", 72, 415, { size: 9 });

    // CMRA checkbox indicator
    drawText(page1, "✓  Yes — CMRA Location", 300, 380, { font: helveticaBold, size: 9, color: NAVY });

    // Pre-fill notice stamp
    page1.drawRectangle({
      x: 72,
      y: height - 110,
      width: 468,
      height: 28,
      color: rgb(0.95, 0.95, 1),
      borderColor: TEAL,
      borderWidth: 1.5,
      opacity: 0.9,
    });
    drawText(page1, "PRE-FILLED BY AI BUSINESS CENTERS — Client: " + clientName + "  |  " + businessName, 80, 100, {
      font: helveticaBold,
      size: 7.5,
      color: NAVY,
    });
    drawText(page1, "Complete blank fields, sign, notarize, and upload to your portal at portal.aibusinesscenters.com", 80, 113, {
      size: 7,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Required action notice on bottom of page 1
    page1.drawRectangle({
      x: 72,
      y: 30,
      width: 468,
      height: 44,
      color: rgb(1, 0.95, 0.95),
      borderColor: RED,
      borderWidth: 1.5,
    });
    drawText(page1, "⚠  REQUIRED: Have this form notarized, then upload it along with two valid photo IDs to activate your address.", 80, height - 35, {
      font: helveticaBold,
      size: 7.5,
      color: RED,
    });
    drawText(page1, "Upload at: portal.aibusinesscenters.com → Documents → Address Activation", 80, height - 47, {
      size: 7,
      color: rgb(0.5, 0.1, 0.1),
    });
    drawText(page1, "Questions: atlas@aibusinesscenters.com", 80, height - 59, {
      size: 7,
      color: rgb(0.5, 0.1, 0.1),
    });

    // ── PAGE 2 (if exists) — add footer ──────────────────────────────
    if (pages.length > 1) {
      const page2 = pages[1];
      const { height: h2 } = page2.getSize();
      page2.drawText("AI Business Centers LLC  •  125 N 9th Street, Frederick, OK 73542  •  aibusinesscenters.com", {
        x: 72,
        y: 20,
        size: 7,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="AIBC-Form-1583-Prefilled.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Form 1583 generation error:", err);
    return NextResponse.json({ error: "Failed to generate Form 1583" }, { status: 500 });
  }
}
