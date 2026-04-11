import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { PlanSummaryDocument } from "@/lib/pdf/plan-summary";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

export async function GET() {
  const effectiveDate = formatDate(new Date());

  const documentElement = React.createElement(PlanSummaryDocument, {
    clientName: "Ricky Kinney",
    businessName: "AI Business Centers LLC",
    accountNumber: "AIBC-PLS-001",
    effectiveDate,
  }) as React.ReactElement;

  const pdfBuffer = await renderToBuffer(documentElement as React.ReactElement<DocumentProps>);

  // @ts-ignore - Node Buffer is supported at runtime
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AIBC-Business-Plus-Plan-Summary.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
