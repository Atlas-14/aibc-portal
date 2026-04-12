import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const NAVY = rgb(0.051, 0.165, 0.290);
const RED = rgb(0.75, 0.1, 0.1);
const TEAL = rgb(0.212, 0.918, 0.918);
const DARK_GRAY = rgb(0.2, 0.2, 0.2);

// pdf-lib y = from bottom. Page height = 792pt.
function yFromTop(yFromTopPt: number): number {
  return 792 - yFromTopPt;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientFirstName = searchParams.get("firstName") || "Ricky";
  const clientLastName = searchParams.get("lastName") || "Kinney";
  const clientName = `${clientFirstName} ${clientLastName}`;
  const businessName = searchParams.get("business") || "AI Business Centers LLC";

  try {
    const formPath = path.join(process.cwd(), "public", "form-1583-official.pdf");
    const existingPdfBytes = fs.readFileSync(formPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page1 = pdfDoc.getPages()[0];

    const fill = (
      x: number,
      yTop: number,
      text: string,
      opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}
    ) => {
      page1.drawText(text, {
        x,
        y: yFromTop(yTop),
        size: opts.size ?? 8.5,
        font: opts.bold ? fontBold : font,
        color: opts.color ?? NAVY,
      });
    };

    // -- SECTION 2 - CMRA Information (pre-filled by AIBC) -------------
    // 2a Street Address
    fill(42, 138, "125 N 9th Street", { bold: true });
    // 2b PMB #
    fill(340, 138, "-");
    // 2c City
    fill(42, 153, "Frederick");
    // 2d State
    fill(215, 153, "OK");
    // 2e ZIP
    fill(270, 153, "73542");

    // -- SECTION 3 - Type of Service (check Business/Organization Use) --
    // Draw an X or checkmark next to "Business/Organization Use"
    fill(42, 175, "X", { bold: true, color: NAVY, size: 9 });

    // -- SECTION 4 - Applicant Name --------------------------------------
    // 4a Last Name
    fill(42, 225, clientLastName, { bold: true });
    // 4b First Name
    fill(195, 225, clientFirstName);

    // -- SECTION 7 - Business/Organization Info (pre-filled) ------------
    // 7a Business name
    fill(42, 430, businessName, { bold: true });
    // 7b Type of Business
    fill(310, 430, "Commercial Mail Receiving Agency Client");
    // 7c Street address
    fill(42, 455, "125 N 9th Street");
    // 7d City
    fill(42, 478, "Frederick");
    // 7e State
    fill(230, 478, "OK");
    // 7f ZIP
    fill(285, 478, "73542");
    // 7g Country
    fill(370, 478, "United States");

    // -- PRE-FILLED NOTICE BANNER ----------------------------------------
    page1.drawRectangle({
      x: 36,
      y: yFromTop(40),
      width: 540,
      height: 26,
      color: rgb(0.93, 0.98, 1),
      borderColor: TEAL,
      borderWidth: 1.2,
    });
    fill(44, 22, `Pre-filled for: ${clientName}  |  ${businessName}  |  AI Business Centers LLC  .  125 N 9th Street, Frederick, OK 73542`, {
      size: 7,
      color: NAVY,
    });
    fill(44, 35, "Complete all blank fields, sign in presence of notary, then upload to your portal at portal.aibusinesscenters.com to activate your address.", {
      size: 6.5,
      color: DARK_GRAY,
    });

    // -- REQUIRED ACTION BOX (bottom) ------------------------------------
    page1.drawRectangle({
      x: 36,
      y: yFromTop(792 - 18),   // very top strip
      width: 540,
      height: 15,
      color: rgb(1, 0.95, 0.95),
      borderColor: RED,
      borderWidth: 1,
    });
    fill(44, 7, "** REQUIRED: This form must be notarized. Upload completed form + 2 valid photo IDs at portal.aibusinesscenters.com -> Documents -> Address Activation.", {
      size: 6.5,
      bold: true,
      color: RED,
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="AIBC-Form-1583-${clientLastName}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Form 1583 generation error:", err);
    return NextResponse.json({ error: "Failed to generate Form 1583: " + String(err) }, { status: 500 });
  }
}
