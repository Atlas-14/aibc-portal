import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type CreditReportingConfirmationProps = {
  clientName: string;
  businessName: string;
  issuedDate: string;
};

const colors = {
  navy: "#0D2A4A",
  teal: "#36EAEA",
  slate: "#5C6B82",
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: "#F2F6FB",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
    marginBottom: 10,
  },
  heading: {
    fontFamily: "Helvetica",
    fontSize: 18,
    letterSpacing: 3,
    color: colors.navy,
  },
  subheading: {
    fontFamily: "Helvetica",
    fontSize: 10,
    letterSpacing: 3,
    color: colors.teal,
    marginTop: 4,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7E2F0",
    padding: 24,
    marginTop: 12,
  },
  label: {
    fontFamily: "Helvetica",
    fontSize: 9,
    letterSpacing: 2,
    color: colors.slate,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: colors.navy,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.slate,
    lineHeight: 1.6,
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 8,
    marginBottom: 12,
  },
  bulletItem: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.navy,
    marginBottom: 6,
  },
  note: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.navy,
    marginTop: 6,
  },
  footer: {
    marginTop: 32,
    alignItems: "flex-end",
  },
  signature: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: colors.navy,
  },
  signatureTitle: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.slate,
  },
});

const bureaus = ["Dun & Bradstreet", "Experian Business", "Equifax Business"];
const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function CreditReportingConfirmation({ clientName, businessName, issuedDate }: CreditReportingConfirmationProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <Text style={styles.heading}>BUSINESS CREDIT REPORTING ENROLLMENT CONFIRMATION</Text>
          <Text style={styles.subheading}>AI BUSINESS CENTERS LLC</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Client Name</Text>
          <Text style={styles.value}>{clientName}</Text>

          <Text style={styles.label}>Business Name</Text>
          <Text style={styles.value}>{businessName}</Text>

          <Text style={styles.paragraph}>
            This confirms that the above business has been enrolled in business credit reporting through AI Business Centers LLC. Monthly payments from your AIBC address plan are submitted as a commercial trade account to the following bureaus:
          </Text>

          <View style={styles.bulletList}>
            {bureaus.map((bureau) => (
              <Text key={bureau} style={styles.bulletItem}>
                • {bureau}
              </Text>
            ))}
          </View>

          <Text style={styles.paragraph}>
            Reporting your on-time payments helps build your business credit profile, demonstrates positive payment history, and supports future access to capital, vendor accounts, and leasing relationships. Maintaining an active plan keeps this reporting line in good standing.
          </Text>

          <Text style={styles.note}>Reporting typically begins within 30-60 days of plan activation.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.signature}>Ricky Kinney</Text>
          <Text style={styles.signatureTitle}>Founder & CEO, AI Business Centers LLC</Text>
          <Text style={styles.signatureTitle}>{issuedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
