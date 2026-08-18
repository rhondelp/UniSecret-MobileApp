import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { apiRequest } from "../src/api/api";
import { 
  ShieldCheck, 
  GraduationCap, 
  MessageSquareQuote, 
  ArrowRight, 
  Sparkles,
  Wifi,
  WifiOff
} from "lucide-react-native";

export default function WelcomeScreen() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await apiRequest("/Universities");
      setApiStatus("connected");
    } catch (error) {
      console.error("API Connection Error:", error);
      setApiStatus("failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      <Animated.View 
        style={[
          styles.container, 
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* ================================= */}
        {/* TOP STATUS BAR PILL */}
        {/* ================================= */}
        <View style={styles.topHeader}>
          <View style={styles.apiStatusBadge}>
            {apiStatus === "checking" && (
              <>
                <ActivityIndicator size="small" color="#EAB308" style={{ marginRight: 6 }} />
                <Text style={styles.apiStatusText}>Connecting...</Text>
              </>
            )}
            {apiStatus === "connected" && (
              <>
                <Wifi size={13} color="#22C55E" style={{ marginRight: 6 }} />
                <Text style={[styles.apiStatusText, { color: "#22C55E" }]}>Network Active</Text>
              </>
            )}
            {apiStatus === "failed" && (
              <>
                <WifiOff size={13} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.apiStatusText, { color: "#EF4444" }]}>Offline Mode</Text>
              </>
            )}
          </View>
        </View>

        {/* ================================= */}
        {/* HERO BRANDING */}
        {/* ================================= */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Sparkles size={32} color="#0A0A0C" />
          </View>
          <Text style={styles.brandName}>
            Uni<Text style={styles.brandGold}>Secret</Text>
          </Text>
          <Text style={styles.tagline}>Your campus. Your anonymous voice.</Text>
        </View>

        {/* ================================= */}
        {/* INTERACTIVE FEATURE LIST */}
        {/* ================================= */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <ShieldCheck size={20} color="#EAB308" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>100% Anonymous</Text>
              <Text style={styles.featureDesc}>Express thoughts safely without identity traces.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <GraduationCap size={20} color="#EAB308" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Campus Exclusive</Text>
              <Text style={styles.featureDesc}>Isolated communities strictly for verified students.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <MessageSquareQuote size={20} color="#EAB308" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Unfiltered Stories</Text>
              <Text style={styles.featureDesc}>Confessions, advice, and real campus chatter.</Text>
            </View>
          </View>
        </View>

        {/* ================================= */}
        {/* BOTTOM ACTION BUTTONS */}
        {/* ================================= */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Sign In</Text>
            <ArrowRight size={18} color="#0A0A0C" style={{ marginLeft: 8 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>Create an Account</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

// =======================================
// STYLESHEET
// =======================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0C", // Obsidian dark backdrop
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  
  // TOP BAR
  topHeader: {
    alignItems: "flex-end",
    paddingTop: 12,
  },
  apiStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  apiStatusText: {
    fontSize: 11.5,
    color: "#A1A1AA",
    fontWeight: "600",
  },

  // HERO SECTION
  heroSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EAB308",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  brandName: {
    fontSize: 30,
    fontWeight: "900",
    color: "#F4F4F5",
    letterSpacing: -0.5,
  },
  brandGold: {
    color: "#EAB308",
  },
  tagline: {
    fontSize: 14,
    color: "#A1A1AA",
    marginTop: 6,
    fontWeight: "500",
  },

  // FEATURES CARD CONTAINER
  featuresContainer: {
    backgroundColor: "#16161A",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#27272A",
    gap: 16,
    marginVertical: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4F4F5",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: "#A1A1AA",
    lineHeight: 16,
  },

  // ACTION SECTION
  actionSection: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    gap: 12,
  },
  primaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EAB308",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#0A0A0C",
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F4F4F5",
    fontSize: 15.5,
    fontWeight: "700",
  },
});