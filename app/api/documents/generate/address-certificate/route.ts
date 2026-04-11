import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { BusinessAddressCertificate } from "@/lib/pdf/business-address-certificate";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

const generateCertificateNumber = () => (Math.floor(10000000 + Math.random() * 90000000)).toString();

export async function GET() {
  const issuedDate = formatDate(new Date());
  const certificateNumber = generateCertificateNumber();

  const documentElement = React.createElement(BusinessAddressCertificate, {
    clientName: "Ricky Kinney",
    businessName: "AI Business Centers LLC",
    suiteName: "Suite 101",
    issuedDate,
    certificateNumber,
  }) as React.ReactElement;

  const pdfBuffer = await renderToBuffer(documentElement as React.ReactElement<DocumentProps>);

  // @ts-ignore - Node Buffer is supported at runtime
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"AIBC-Business-Address-Certificate.pdf\"",
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
