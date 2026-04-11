import React from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

Font.register({
  family: "PlayfairDisplay",
  src: "https://fonts.gstatic.com/s/playfairdisplay/v30/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYhWtfA8Q.woff2",
});

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

export type BusinessAddressCertificateProps = {
  clientName: string;
  businessName: string;
  suiteName?: string;
  issuedDate: string;
  certificateNumber: string;
};

const colors = {
  navy: "#0D2A4A",
  teal: "#36EAEA",
  dark: "#071829",
  light: "#E6E9ED",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 48,
    backgroundColor: "#f7f9fc",
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
  },
  companyName: {
    fontFamily: "Inter",
    fontWeight: 600,
    fontSize: 16,
    color: colors.teal,
    marginTop: 12,
    letterSpacing: 2,
  },
  divider: {
    height: 2,
    backgroundColor: colors.teal,
    marginVertical: 16,
    width: "80%",
    alignSelf: "center",
  },
  certificateHeading: {
    fontFamily: "PlayfairDisplay",
    fontSize: 28,
    textAlign: "center",
    color: colors.navy,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subheading: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.dark,
    textAlign: "center",
    marginBottom: 24,
  },
  framedBox: {
    borderWidth: 1,
    borderColor: colors.teal,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 24,
    backgroundColor: "white",
  },
  sectionLabel: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.navy,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  businessName: {
    fontFamily: "PlayfairDisplay",
    fontSize: 22,
    color: colors.navy,
    marginBottom: 8,
  },
  ownerName: {
    fontFamily: "Inter",
    fontSize: 13,
    color: colors.dark,
    marginBottom: 10,
  },
  address: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.dark,
    lineHeight: 1.6,
  },
  compliance: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.dark,
    marginTop: 12,
  },
  issueDate: {
    fontFamily: "Inter",
    fontSize: 12,
    color: colors.navy,
    marginTop: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 32,
    paddingHorizontal: 24,
  },
  certificateNumberBox: {
    borderTopWidth: 1,
    borderColor: colors.light,
    paddingTop: 12,
  },
  certificateNumberLabel: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.dark,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  certificateNumberValue: {
    fontFamily: "PlayfairDisplay",
    fontSize: 18,
    color: colors.navy,
    marginTop: 4,
  },
  signatureBlock: {
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderColor: colors.dark,
    marginBottom: 6,
  },
  signatureName: {
    fontFamily: "PlayfairDisplay",
    fontSize: 16,
    color: colors.navy,
  },
  signatureTitle: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.dark,
  },
  footerBar: {
    marginTop: 36,
    backgroundColor: colors.teal,
    paddingVertical: 10,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Inter",
    fontSize: 10,
    color: colors.dark,
    letterSpacing: 2,
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function BusinessAddressCertificate({
  clientName,
  businessName,
  suiteName = "Suite 101",
  issuedDate,
  certificateNumber,
}: BusinessAddressCertificateProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <Text style={styles.companyName}>AI BUSINESS CENTERS LLC</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.certificateHeading}>CERTIFICATE OF BUSINESS ADDRESS</Text>
        <Text style={styles.subheading}>
          This certifies that the following business has established a professional commercial address at our AI Business Center location.
        </Text>

        <View style={styles.framedBox}>
          <Text style={styles.sectionLabel}>Business Name</Text>
          <Text style={styles.businessName}>{businessName}</Text>

          <Text style={styles.sectionLabel}>Owner</Text>
          <Text style={styles.ownerName}>{clientName}</Text>

          <Text style={styles.sectionLabel}>Registered Address</Text>
          <Text style={styles.address}>
            {`125 N 9th Street, ${suiteName}, Frederick, Oklahoma 73542`}
            {"\n"}
            United States
          </Text>

          <Text style={styles.compliance}>This address is registered and maintained in compliance with USPS CMRA regulations.</Text>
          <Text style={styles.issueDate}>Issued on {issuedDate}</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.certificateNumberBox}>
            <Text style={styles.certificateNumberLabel}>Certificate Number</Text>
            <Text style={styles.certificateNumberValue}>{certificateNumber}</Text>
          </View>

          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>Ricky Kinney</Text>
            <Text style={styles.signatureTitle}>Founder & CEO, AI Business Centers LLC</Text>
          </View>
        </View>

        <View style={styles.footerBar}>
          <Text style={styles.footerText}>aibusinesscenters.com</Text>
        </View>
      </Page>
    </Document>
  );
}
