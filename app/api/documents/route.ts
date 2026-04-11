import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const mockDocuments = [
  {
    id: "aibc-business-address",
    fileName: "AIBC Business Address Certificate.pdf",
    description: "Your official commercial address confirmation at 125 N 9th Street, Frederick, OK 73542",
    fileType: "application/pdf",
    fileSize: 524288,
    fromAibc: true,
    uploadedAt: "2024-03-01T15:00:00.000Z",
  },
  {
    id: "aibc-plan-confirmation",
    fileName: "Business Plus Plan Confirmation.pdf",
    description: "Your current plan details and account information",
    fileType: "application/pdf",
    fileSize: 262144,
    fromAibc: true,
    uploadedAt: "2024-02-15T18:30:00.000Z",
  },
];

export async function GET() {
  return NextResponse.json({ documents: mockDocuments });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const category = (formData.get("category") as string) || "other";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File upload is required" }, { status: 400 });
    }

    const mimeType = (file.type || "").toLowerCase();

    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF, PNG, JPG, JPEG, or WEBP files." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum upload size is 10MB." },
        { status: 400 }
      );
    }

    const document = {
      id: randomUUID(),
      fileName: file.name,
      fileType: mimeType || "application/octet-stream",
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      category: category.toLowerCase(),
      fromAibc: false,
      storageKey: "aibc_documents",
    };

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
