import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { CreditReportingConfirmation } from "@/lib/pdf/credit-reporting-confirmation";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

export async function GET() {
  const issuedDate = formatDate(new Date());

  const documentElement = React.createElement(CreditReportingConfirmation, {
    clientName: "Ricky Kinney",
    businessName: "AI Business Centers LLC",
    issuedDate,
  }) as React.ReactElement;

  const pdfBuffer = await renderToBuffer(documentElement as React.ReactElement<DocumentProps>);

  // @ts-ignore - Node Buffer is supported at runtime
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AIBC-Credit-Reporting-Confirmation.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
