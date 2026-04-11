import React from "react";
import { NextResponse } from "next/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { MemberIdCard } from "@/lib/pdf/member-id-card";

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const generateMemberId = () => (Math.floor(10000000 + Math.random() * 90000000)).toString();

export async function GET() {
  const memberSince = formatDate(new Date());

  const documentElement = React.createElement(MemberIdCard, {
    clientName: "Ricky Kinney",
    businessName: "AI Business Centers LLC",
    memberSince,
    memberId: generateMemberId(),
  }) as React.ReactElement;

  const pdfBuffer = await renderToBuffer(documentElement as React.ReactElement<DocumentProps>);

  // @ts-ignore - Node Buffer is supported at runtime
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="AIBC-Member-ID-Card.pdf"',
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
