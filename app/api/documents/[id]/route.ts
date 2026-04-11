import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await context.params;

  if (!documentId) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  return NextResponse.json({
    id: documentId,
    removed: true,
    storageKey: "aibc_documents",
    message: "Remove this document from the local client store to reflect deletion.",
  });
}
