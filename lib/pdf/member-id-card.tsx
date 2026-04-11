import React from "react";
import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type MemberIdCardProps = {
  clientName: string;
  businessName: string;
  memberSince: string;
  memberId: string;
  planName?: string;
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#030A16",
  },
  card: {
    flex: 1,
    backgroundColor: "#051B33",
    borderRadius: 20,
    margin: 20,
    padding: 18,
    color: "white",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 42,
    height: 42,
    objectFit: "contain",
  },
  title: {
    fontFamily: "Helvetica",
    fontSize: 14,
    letterSpacing: 2,
    color: "#36EAEA",
  },
  infoBlock: {
    marginTop: 10,
  },
  label: {
    fontFamily: "Helvetica",
    fontSize: 8,
    letterSpacing: 2,
    color: "#7DD3D7",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: "white",
  },
  footer: {
    marginTop: 8,
  },
  memberId: {
    fontFamily: "Helvetica",
    fontSize: 12,
    letterSpacing: 4,
    color: "#36EAEA",
  },
  tagline: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "white",
    textAlign: "center",
    letterSpacing: 1,
  },
});

const logoSource = `${process.cwd()}/public/aibc-logo-transparent.png`;

export function MemberIdCard({ clientName, businessName, memberSince, memberId, planName = "Business Plus" }: MemberIdCardProps) {
  return (
    <Document>
      <Page size={{ width: 252, height: 144 }} orientation="landscape" style={styles.page}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Image src={logoSource} style={styles.logo} />
            <Text style={styles.title}>AI BUSINESS CENTERS</Text>
          </View>

          <View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Member Name</Text>
              <Text style={styles.value}>{clientName}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Business</Text>
              <Text style={styles.value}>{businessName}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>{memberSince}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>{planName}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>125 N 9th Street, Frederick, OK</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.label}>Member ID</Text>
            <Text style={styles.memberId}>{memberId}</Text>
          </View>

          <Text style={styles.tagline}>Pioneers in AI + Commercial Real Estate</Text>
        </View>
      </Page>
    </Document>
  );
}
