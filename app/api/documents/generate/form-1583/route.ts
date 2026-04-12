import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { Form1583Prefilled } from "@/lib/pdf/form-1583-prefilled";

export async function GET() {
  const documentElement = React.createElement(Form1583Prefilled, {
    clientName: "Ricky Kinney",
    businessName: "AI Business Centers LLC",
  }) as React.ReactElement;

  const pdfBuffer = await renderToBuffer(documentElement as React.ReactElement<DocumentProps>);

  // @ts-ignore - Node Buffer is supported at runtime
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AIBC-Form-1583.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
