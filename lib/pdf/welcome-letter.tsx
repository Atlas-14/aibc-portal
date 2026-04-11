import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3ha8g7QyeLqGS9KhWCKw.woff2",
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcC73FwrK3ha8g7QyeLqGS9KhTcS0f3rCw.woff2",
      fontWeight: 600,
    },
  ],
});

export type WelcomeLetterProps = {
  clientName: string;
  businessName: string;
  date: string;
};

const colors = {
  navy: "#0D2A4A",
  teal: "#36EAEA",
  dark: "#071829",
  light: "#E6E9ED",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingHorizontal: 72,
    backgroundColor: "#fff",
    fontFamily: "Inter",
    fontSize: 12,
    lineHeight: 1.6,
    color: colors.dark,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
  },
  companyInfo: {
    textAlign: "right",
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.dark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.teal,
    marginVertical: 12,
  },
  date: {
    textAlign: "right",
    marginBottom: 24,
    fontSize: 12,
  },
  greeting: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.navy,
    marginBottom: 16,
  },
  paragraph: {
    marginBottom: 14,
  },
  closing: {
    marginTop: 12,
  },
  signatureName: {
    fontSize: 16,
    color: colors.navy,
    marginBottom: 4,
  },
  signatureTitle: {
    fontSize: 11,
  },
  postSignatureDivider: {
    height: 1,
    backgroundColor: colors.teal,
    marginTop: 18,
    marginBottom: 12,
  },
  footer: {
    fontSize: 10,
    textAlign: "center",
    color: colors.dark,
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function WelcomeLetter({ clientName, businessName, date }: WelcomeLetterProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <View>
            <Text style={styles.companyInfo}>AI Business Centers LLC</Text>
            <Text style={styles.companyInfo}>125 N 9th Street</Text>
            <Text style={styles.companyInfo}>Frederick, OK 73542</Text>
            <Text style={styles.companyInfo}>aibusinesscenters.com</Text>
            <Text style={styles.companyInfo}>atlas@aibusinesscenters.com</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.date}>{date}</Text>

        <Text style={styles.greeting}>Dear {businessName},</Text>

        <Text style={styles.paragraph}>
          Welcome to AI Business Centers. I want to personally take a moment to thank you for trusting us with your business identity.
        </Text>
        <Text style={styles.paragraph}>
          When I built AI Business Centers, I did it because I believed that every business owner deserves the infrastructure of a world-class
          company — a real commercial address, professional operations, AI-powered tools, and the kind of business credit foundation that opens
          doors to capital and opportunity.
        </Text>
        <Text style={styles.paragraph}>
          You now have all of that. Your commercial address at 125 N 9th Street, Frederick, Oklahoma is active. Your mail is being handled
          professionally. Your AI Business Center team is here to support you every step of the way.
        </Text>
        <Text style={styles.paragraph}>
          This is more than a mailbox. This is the beginning of building something real.
        </Text>
        <Text style={styles.paragraph}>
          I am genuinely grateful you, {clientName || businessName}, chose to build with us. If there is ever anything I can personally do for you, do not
          hesitate to reach out.
        </Text>
        <Text style={styles.paragraph}>Here's to what you're building.</Text>

        <Text style={styles.closing}>With gratitude,</Text>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.signatureName}>Ricky Kinney</Text>
          <Text style={styles.signatureTitle}>Founder & CEO</Text>
          <Text style={styles.signatureTitle}>AI Business Centers LLC</Text>
          <Text style={styles.signatureTitle}>aibusinesscenters.com</Text>
        </View>

        <View style={styles.postSignatureDivider} />

        <Text style={styles.footer}>AI Business Centers LLC · 125 N 9th Street, Frederick, OK 73542 · aibusinesscenters.com</Text>
      </Page>
    </Document>
  );
}
