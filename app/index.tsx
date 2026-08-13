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
      <StatusBar barStyle="light-content" backgroundColor="#070A0F" />

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
                <ActivityIndicator size="small" color="#6366F1" style={{ marginRight: 6 }} />
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
            <Sparkles size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brandName}>UniSecret</Text>
          <Text style={styles.tagline}>Your campus. Your anonymous voice.</Text>
        </View>

        {/* ================================= */}
        {/* INTERACTIVE FEATURE LIST */}
        {/* ================================= */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <ShieldCheck size={20} color="#6366F1" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>100% Anonymous</Text>
              <Text style={styles.featureDesc}>Express thoughts safely without identity traces.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <GraduationCap size={20} color="#38BDF8" />
            </View>
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Campus Exclusive</Text>
              <Text style={styles.featureDesc}>Isolated communities strictly for verified students.</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureIconBox}>
              <MessageSquareQuote size={20} color="#EC4899" />
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
            <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
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
    backgroundColor: "#070A0F", // Deep ultra-modern obsidian backdrop
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  
  // TOP BAR
  topHeader: {
    alignItems: "flex-end",
    paddingTop: 10,
  },
  apiStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121826",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  apiStatusText: {
    fontSize: 11.5,
    color: "#94A3B8",
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
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F8FAFC",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13.5,
    color: "#94A3B8",
    marginTop: 4,
    fontWeight: "500",
  },

  // FEATURES CARD CONTAINER
  featuresContainer: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1F2937",
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
    backgroundColor: "#1F2937",
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
    color: "#F1F5F9",
    marginBottom: 1,
  },
  featureDesc: {
    fontSize: 12,
    color: "#94A3B8",
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
    height: 54,
    borderRadius: 14,
    backgroundColor: "#6366F1",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "700",
  },
  secondaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#121826",
    borderWidth: 1,
    borderColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#E2E8F0",
    fontSize: 15.5,
    fontWeight: "700",
  },
});