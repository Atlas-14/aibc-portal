import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type Form1583PrefilledProps = {
  clientName: string;
  businessName: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
  },
  headerTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
  },
  headerSubtitle: {
    marginTop: 2,
  },
  headerMeta: {
    alignItems: "flex-end",
    fontSize: 9,
  },
  note: {
    fontSize: 9,
    marginBottom: 12,
  },
  section: {
    borderWidth: 1,
    borderColor: "#000000",
    marginBottom: 12,
  },
  sectionHeader: {
    backgroundColor: "#F0F0F0",
    padding: 6,
  },
  sectionHeaderText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  sectionBody: {
    padding: 10,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldRowItem: {
    flex: 1,
  },
  fieldRowSpacing: {
    marginRight: 10,
  },
  field: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginBottom: 2,
  },
  fieldValue: {
    borderWidth: 1,
    borderColor: "#000000",
    padding: 6,
    minHeight: 24,
    justifyContent: "center",
  },
  valuePrefilled: {
    color: "#0D2A4A",
    fontSize: 9,
  },
  valueBlank: {
    color: "#6B7280",
    fontSize: 9,
  },
  noteSmall: {
    fontSize: 8,
    color: "#6B7280",
  },
  checkboxList: {
    marginTop: -4,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    fontSize: 9,
    marginBottom: 4,
  },
  checkboxMark: {
    fontFamily: "Helvetica-Bold",
    marginRight: 6,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderColor: "#000000",
    height: 18,
    marginTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    marginTop: 2,
  },
  importantBox: {
    borderWidth: 1,
    borderColor: "#B91C1C",
    padding: 10,
    marginTop: 8,
  },
  importantLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#B91C1C",
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 9,
    lineHeight: 1.4,
  },
});

type FieldProps = {
  label: string;
  value: string;
  variant?: "prefilled" | "blank";
};

const Field: React.FC<FieldProps> = ({ label, value, variant = "blank" }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.fieldValue}>
      <Text style={variant === "prefilled" ? styles.valuePrefilled : styles.valueBlank}>{value}</Text>
    </View>
  </View>
);

export function Form1583Prefilled({ clientName, businessName }: Form1583PrefilledProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>APPLICATION FOR DELIVERY OF MAIL THROUGH AGENT</Text>
            <Text style={styles.headerSubtitle}>United States Postal Service</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text>PS Form 1583</Text>
            <Text>OMB No. 1220-0191</Text>
          </View>
        </View>
        <Text style={styles.note}>
          Complete ALL items. Applicant must personally appear before and be identified by the Agent before this form is completed.
        </Text>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Section 1 — Applicant</Text>
          </View>
          <View style={styles.sectionBody}>
            <Field label="Name (Full Legal Name)" value={clientName} variant="prefilled" />
            <Field label="Business Name (if applicable)" value={businessName} variant="prefilled" />
            <Field label="Home/Business Address (Street, City, State, ZIP)" value="____________________________________________" />
            <View style={styles.fieldRow}>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="Phone" value="________________________" />
              </View>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="Email" value="________________________" />
              </View>
              <View style={styles.fieldRowItem}>
                <Field label="Date of Birth" value="________________________" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Section 2 — Authorized Agent</Text>
          </View>
          <View style={styles.sectionBody}>
            <Field label="Agent Name" value="AI Business Centers LLC" variant="prefilled" />
            <Field label="Agent Address" value="125 N 9th Street, Frederick, Oklahoma 73542" variant="prefilled" />
            <Field label="Agent Phone" value="Not required" variant="prefilled" />
            <Field label="CMRA Status" value="Yes — this address is a Commercial Mail Receiving Agency (CMRA)" variant="prefilled" />
            <Text style={styles.noteSmall}>Do not modify this section. Provided by AI Business Centers LLC.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Section 3 — Type of Mail Authorized</Text>
          </View>
          <View style={[styles.sectionBody, styles.checkboxList]}>
            <Text style={styles.checkboxItem}><Text style={styles.checkboxMark}>✓</Text>Letters and Cards</Text>
            <Text style={styles.checkboxItem}><Text style={styles.checkboxMark}>✓</Text>Flats (Large Envelopes)</Text>
            <Text style={styles.checkboxItem}><Text style={styles.checkboxMark}>✓</Text>Packages</Text>
            <Text style={styles.checkboxItem}><Text style={styles.checkboxMark}>✓</Text>Express Mail / Priority Mail</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Section 4 — Identification (to be completed by Agent)</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.noteSmall}>Two forms of valid photo identification are required.</Text>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="ID 1 Type" value="________________________" />
              </View>
              <View style={styles.fieldRowItem}>
                <Field label="ID 1 Number" value="________________________" />
              </View>
            </View>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="ID 2 Type" value="________________________" />
              </View>
              <View style={styles.fieldRowItem}>
                <Field label="ID 2 Number" value="________________________" />
              </View>
            </View>
            <Field label="Date Identified" value="________________________" />
            <View style={styles.fieldRow}>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="Agent Signature" value="________________________" />
              </View>
              <View style={styles.fieldRowItem}>
                <Field label="Date" value="________________________" />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Section 5 — Applicant Signature</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text>
              I certify that all information provided is accurate and complete. I authorize the agent named above to receive mail on my behalf.
            </Text>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldRowItem, styles.fieldRowSpacing]}>
                <Field label="Applicant Signature" value="________________________" />
              </View>
              <View style={styles.fieldRowItem}>
                <Field label="Date" value="________________________" />
              </View>
            </View>
            <Field label="Print Name" value={clientName} variant="prefilled" />
          </View>
        </View>

        <View style={styles.importantBox}>
          <Text style={styles.importantLabel}>IMPORTANT</Text>
          <Text>
            This form must be notarized or witnessed by an authorized USPS representative. Your address at AI Business Centers will not be activated until this completed form, with notarization, and two valid photo IDs are submitted to atlas@aibusinesscenters.com or uploaded to your client portal.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>AI Business Centers LLC • 125 N 9th Street, Frederick, OK 73542 • aibusinesscenters.com</Text>
          <Text>PS Form 1583, Revision 2020 • Pre-filled for: {clientName} / {businessName}</Text>
        </View>
      </Page>
    </Document>
  );
}
