import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type PlanSummaryProps = {
  clientName: string;
  businessName: string;
  accountNumber: string;
  effectiveDate: string;
  addressLine?: string;
  planName?: string;
  monthlyRate?: string;
};

const colors = {
  navy: "#0D2A4A",
  teal: "#36EAEA",
  slate: "#5F6F85",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 48,
    backgroundColor: "#f5f8fb",
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
  heading: {
    fontFamily: "Helvetica",
    fontSize: 18,
    letterSpacing: 3,
    color: colors.navy,
  },
  subheading: {
    fontFamily: "Helvetica",
    fontSize: 10,
    letterSpacing: 4,
    color: colors.teal,
    marginTop: 4,
  },
  divider: {
    height: 2,
    backgroundColor: colors.teal,
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  infoBox: {
    width: "48%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  label: {
    fontFamily: "Helvetica",
    fontSize: 9,
    letterSpacing: 2,
    color: colors.slate,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  value: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: colors.navy,
  },
  featuresCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D7E2F0",
    backgroundColor: "white",
    padding: 18,
    marginBottom: 18,
  },
  featuresHeading: {
    fontFamily: "Helvetica",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 2,
    color: colors.navy,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#EEF2F7",
  },
  featureName: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.slate,
  },
  featureValue: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.navy,
    fontWeight: 700,
  },
  addressBlock: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#0D2A4A",
  },
  addressLabel: {
    fontFamily: "Helvetica",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.teal,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  addressValue: {
    fontFamily: "Helvetica",
    fontSize: 14,
    color: "white",
  },
  note: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.navy,
    marginTop: 16,
  },
  footer: {
    marginTop: 36,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    letterSpacing: 2,
    color: colors.teal,
  },
});

const features = [
  { name: "Mail items per month", value: "75" },
  { name: "Scan requests", value: "20" },
  { name: "Scanned pages", value: "100" },
  { name: "Forward requests", value: "6" },
  { name: "Forward shipments", value: "4" },
  { name: "Check deposits", value: "2" },
  { name: "Shred & recycle", value: "Unlimited" },
];

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function PlanSummaryDocument({
  clientName,
  businessName,
  accountNumber,
  effectiveDate,
  addressLine = "125 N 9th Street, Frederick, OK 73542",
  planName = "Business Plus",
  monthlyRate = "$99/month",
}: PlanSummaryProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Image src={logoSource} style={styles.logo} />
          <View>
            <Text style={styles.heading}>PLAN CONFIRMATION SUMMARY</Text>
            <Text style={styles.subheading}>AI BUSINESS CENTERS</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Client Name</Text>
            <Text style={styles.value}>{clientName}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Business Name</Text>
            <Text style={styles.value}>{businessName}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{accountNumber}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Effective Date</Text>
            <Text style={styles.value}>{effectiveDate}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Plan</Text>
            <Text style={styles.value}>{planName}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Monthly Rate</Text>
            <Text style={styles.value}>{monthlyRate}</Text>
          </View>
        </View>

        <View style={styles.featuresCard}>
          <Text style={styles.featuresHeading}>Included Features</Text>
          {features.map((feature) => (
            <View key={feature.name} style={styles.featureRow}>
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureValue}>{feature.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.addressBlock}>
          <Text style={styles.addressLabel}>Commercial Address</Text>
          <Text style={styles.addressValue}>{addressLine}</Text>
        </View>

        <Text style={styles.note}>This plan is active as of {effectiveDate}. Payments are processed monthly.</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AI BUSINESS CENTERS • aibusinesscenters.com</Text>
        </View>
      </Page>
    </Document>
  );
}
