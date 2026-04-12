import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type MemberIdCardProps = {
  clientName: string;
  businessName: string;
  memberSince: string;
  memberId: string;
};

const styles = StyleSheet.create({
  page: {
    width: 252,
    height: 153,
    padding: 0,
    backgroundColor: "#0D2A4A",
    fontFamily: "Helvetica",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    objectFit: "contain",
  },
  brandText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1,
    color: "#FFFFFF",
    marginLeft: 8,
  },
  memberBadge: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1,
    color: "#36EAEA",
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#36EAEA",
    opacity: 0.8,
    marginTop: 6,
  },
  textGroup: {
    marginTop: 12,
  },
  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  businessName: {
    fontSize: 8,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  detailColumn: {
    width: "33%",
  },
  detailLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 5,
    color: "#36EAEA",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 8,
    color: "#FFFFFF",
    marginTop: 3,
  },
  decoration: {
    alignItems: "flex-end",
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#36EAEA",
    alignSelf: "flex-end",
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function MemberIdCard({ clientName, businessName, memberSince, memberId }: MemberIdCardProps) {
  return (
    <Document>
      <Page size={{ width: 252, height: 153 }} orientation="landscape" style={styles.page}>
        <View style={styles.content}>
          <View>
            <View style={styles.headerRow}>
              <View style={styles.brandGroup}>
                <Image src={logoSource} style={styles.logo} />
                <Text style={styles.brandText}>AI BUSINESS CENTERS</Text>
              </View>
              <Text style={styles.memberBadge}>MEMBER</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.textGroup}>
              <Text style={styles.clientName}>{clientName}</Text>
              <Text style={styles.businessName}>{businessName}</Text>
            </View>
          </View>

          <View>
            <View style={styles.detailsRow}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>PLAN</Text>
                <Text style={styles.detailValue}>Business Plus</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>MEMBER SINCE</Text>
                <Text style={styles.detailValue}>{memberSince}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>ID</Text>
                <Text style={styles.detailValue}>{memberId}</Text>
              </View>
            </View>
            <View style={styles.decoration}>
              <View style={styles.accentDot} />
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
