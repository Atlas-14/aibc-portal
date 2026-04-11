import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type Form1583PrefilledProps = {
  clientName: string;
  businessName: string;
  issuedDate: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: "#F8FAFD",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    objectFit: "contain",
  },
  headingGroup: {
    alignItems: "flex-end",
  },
  heading: {
    fontSize: 18,
    letterSpacing: 2,
    color: "#0D2A4A",
  },
  subheading: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#36EAEA",
    marginTop: 4,
  },
  introCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E1E8F2",
    padding: 20,
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.6,
    marginBottom: 10,
  },
  list: {
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 11,
    color: "#0D2A4A",
    marginBottom: 6,
  },
  note: {
    fontSize: 11,
    color: "#B45309",
    fontWeight: 700,
    marginTop: 12,
  },
  contact: {
    fontSize: 11,
    color: "#0D2A4A",
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
  },
  footerText: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#36EAEA",
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function Form1583Prefilled({ clientName, businessName, issuedDate }: Form1583PrefilledProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <View style={styles.headingGroup}>
            <Text style={styles.heading}>USPS FORM 1583 — REQUIRED FOR ADDRESS ACTIVATION</Text>
            <Text style={styles.subheading}>AI BUSINESS CENTERS LLC</Text>
          </View>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.paragraph}>
            Dear {clientName}, this cover sheet outlines how to complete the USPS Form 1583 so we can activate the commercial mailing address for {businessName}. USPS regulations require a notarized Form 1583 for all Commercial Mail Receiving Agency (CMRA) clients before mail can be released or forwarded.
          </Text>

          <Text style={styles.paragraph}>Pre-filled CMRA (agent) information you will need:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>• Agent: AI Business Centers LLC</Text>
            <Text style={styles.listItem}>• Address: 125 N 9th Street, Frederick, OK 73542</Text>
          </View>

          <Text style={styles.paragraph}>Steps to complete your Form 1583:</Text>
          <View style={styles.list}>
            <Text style={styles.listItem}>1. Download the official USPS Form 1583 from usps.com.</Text>
            <Text style={styles.listItem}>2. Complete Section 1 with your personal/business information. Section 2 already lists AI Business Centers LLC as the agent.</Text>
            <Text style={styles.listItem}>3. Have the form notarized in person or via an online notary service.</Text>
            <Text style={styles.listItem}>4. Upload the completed Form 1583 plus two valid government-issued photo IDs to the Documents tab inside your AIBC portal.</Text>
            <Text style={styles.listItem}>5. Our compliance team will review and activate your address within 1-2 business days of submission.</Text>
          </View>

          <Text style={styles.note}>Important: Your commercial address will not be active until a notarized Form 1583 and two IDs have been received and processed.</Text>
          <Text style={styles.contact}>Questions? Email atlas@aibusinesscenters.com. Issued {issuedDate}.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI BUSINESS CENTERS • aibusinesscenters.com</Text>
        </View>
      </Page>
    </Document>
  );
}
