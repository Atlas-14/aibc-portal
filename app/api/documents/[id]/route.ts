import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  const documentId = context.params?.id;

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
