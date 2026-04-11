import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type MailAuthorizationProps = {
  clientName: string;
  businessName: string;
  issuedDate: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 56,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 84,
    height: 84,
    objectFit: "contain",
  },
  heading: {
    fontSize: 20,
    letterSpacing: 3,
    color: "#0D2A4A",
  },
  subheading: {
    fontSize: 10,
    letterSpacing: 4,
    color: "#36EAEA",
    marginTop: 4,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#13263F",
  },
  paragraph: {
    marginBottom: 14,
  },
  signatureBlock: {
    marginTop: 40,
  },
  signatureName: {
    fontSize: 14,
    color: "#0D2A4A",
  },
  signatureTitle: {
    fontSize: 10,
    color: "#5D6C80",
  },
  footer: {
    marginTop: 48,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E7EF",
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#36EAEA",
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function MailAuthorizationLetter({ clientName, businessName, issuedDate }: MailAuthorizationProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <View>
            <Text style={styles.heading}>MAIL HANDLING AUTHORIZATION</Text>
            <Text style={styles.subheading}>AI BUSINESS CENTERS LLC</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>To Whom It May Concern,</Text>

          <Text style={styles.paragraph}>
            This letter confirms that <Text style={{ fontWeight: 700 }}>{businessName}</Text>, operated by <Text style={{ fontWeight: 700 }}>{clientName}</Text>, is authorized to receive all business correspondence at 125 N 9th Street, Frederick, Oklahoma 73542.
          </Text>

          <Text style={styles.paragraph}>
            The above address is a registered Commercial Mail Receiving Agency (CMRA) location managed by AI Business Centers LLC. Our team maintains USPS compliance procedures, secure mail handling, and verified identity requirements for every client account.
          </Text>

          <Text style={styles.paragraph}>
            This commercial address may be used for business registration, banking relationships, merchant processing, vendor correspondence, and other official communications tied to {businessName}. Our operations team monitors daily deliveries to ensure items are logged, scanned, and forwarded per the client's instructions.
          </Text>

          <Text style={styles.paragraph}>Please direct any questions to atlas@aibusinesscenters.com.</Text>

          <Text style={styles.paragraph}>Sincerely,</Text>

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureName}>Ricky Kinney</Text>
            <Text style={styles.signatureTitle}>Founder & CEO, AI Business Centers LLC</Text>
            <Text style={styles.signatureTitle}>{issuedDate}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI BUSINESS CENTERS • aibusinesscenters.com</Text>
        </View>
      </Page>
    </Document>
  );
}
