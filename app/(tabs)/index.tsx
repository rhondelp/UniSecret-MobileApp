import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import { apiRequest } from "../../src/api/api";

export default function WelcomeScreen() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");

  useEffect(() => {
    checkApi();
  }, []);

  const checkApi = async () => {
    try {
      await apiRequest("/Universities");

      setApiStatus("connected");

    } catch (error) {
      console.error(
        "API Connection Error:",
        error
      );

      setApiStatus("failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F7F7F8"
      />

      <View style={styles.container}>

        {/* -------------------------------- */}
        {/* TOP BRAND */}
        {/* -------------------------------- */}

        <View style={styles.topSection}>

          <View style={styles.logo}>
            <Text style={styles.logoText}>
              U
            </Text>
          </View>

          <Text style={styles.brand}>
            UniSecret
          </Text>

          <Text style={styles.tagline}>
            Your campus. Your stories.
          </Text>

        </View>

        {/* -------------------------------- */}
        {/* MAIN CONTENT */}
        {/* -------------------------------- */}

        <View style={styles.content}>

          <Text style={styles.title}>
            A space to speak freely.
          </Text>

          <Text style={styles.description}>
            Share your thoughts, secrets,
            stories, and experiences with
            your university community.
          </Text>

          {/* -------------------------------- */}
          {/* FEATURE CARDS */}
          {/* -------------------------------- */}

          <View style={styles.features}>

            <View style={styles.featureCard}>

              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>
                  🔒
                </Text>
              </View>

              <View style={styles.featureContent}>

                <Text style={styles.featureTitle}>
                  Anonymous
                </Text>

                <Text style={styles.featureText}>
                  Share without revealing
                  your identity.
                </Text>

              </View>

            </View>

            <View style={styles.featureCard}>

              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>
                  🎓
                </Text>
              </View>

              <View style={styles.featureContent}>

                <Text style={styles.featureTitle}>
                  University Community
                </Text>

                <Text style={styles.featureText}>
                  Connect with students
                  from your university.
                </Text>

              </View>

            </View>

            <View style={styles.featureCard}>

              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>
                  💬
                </Text>
              </View>

              <View style={styles.featureContent}>

                <Text style={styles.featureTitle}>
                  Speak Your Mind
                </Text>

                <Text style={styles.featureText}>
                  Share confessions,
                  opinions, and stories.
                </Text>

              </View>

            </View>

          </View>

        </View>

        {/* -------------------------------- */}
        {/* BOTTOM ACTIONS */}
        {/* -------------------------------- */}

        <View style={styles.bottomSection}>

          {/* SIGN IN */}

          <TouchableOpacity
            style={styles.loginButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/login")
            }
          >

            <Text style={styles.loginButtonText}>
              Sign In
            </Text>

          </TouchableOpacity>

          {/* REGISTER */}

          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={0.8}
            onPress={() =>
              router.push("/register")
            }
          >

            <Text style={styles.registerButtonText}>
              Create an Account
            </Text>

          </TouchableOpacity>

          {/* API STATUS */}

          <View style={styles.apiStatus}>

            {apiStatus === "checking" && (
              <>
                <ActivityIndicator
                  size="small"
                  color="#777777"
                />

                <Text style={styles.apiText}>
                  Connecting to UniSecret...
                </Text>
              </>
            )}

            {apiStatus === "connected" && (
              <>
                <View
                  style={[
                    styles.statusDot,
                    styles.connectedDot,
                  ]}
                />

                <Text style={styles.apiText}>
                  UniSecret is ready
                </Text>
              </>
            )}

            {apiStatus === "failed" && (
              <>
                <View
                  style={[
                    styles.statusDot,
                    styles.failedDot,
                  ]}
                />

                <Text style={styles.apiText}>
                  Unable to connect to server
                </Text>
              </>
            )}

          </View>

          <Text style={styles.footer}>
            UniSecret • Your university community
          </Text>

        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // --------------------------------
  // GENERAL
  // --------------------------------

  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: "space-between",
  },

  // --------------------------------
  // BRAND
  // --------------------------------

  topSection: {
    alignItems: "center",
    paddingTop: 10,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
  },

  brand: {
    color: "#111111",
    fontSize: 30,
    fontWeight: "800",
  },

  tagline: {
    color: "#777777",
    fontSize: 14,
    marginTop: 5,
  },

  // --------------------------------
  // MAIN CONTENT
  // --------------------------------

  content: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  title: {
    color: "#111111",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    color: "#777777",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 10,
    marginBottom: 25,
  },

  // --------------------------------
  // FEATURES
  // --------------------------------

  features: {
    gap: 10,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#F1F1F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  featureIconText: {
    fontSize: 20,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
  },

  featureText: {
    color: "#777777",
    fontSize: 12,
    lineHeight: 17,
  },

  // --------------------------------
  // BOTTOM
  // --------------------------------

  bottomSection: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },

  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  registerButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
  },

  registerButtonText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  // --------------------------------
  // API STATUS
  // --------------------------------

  apiStatus: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    marginRight: 6,
  },

  connectedDot: {
    backgroundColor: "#16A34A",
  },

  failedDot: {
    backgroundColor: "#DC2626",
  },

  apiText: {
    color: "#888888",
    fontSize: 11,
  },

  // --------------------------------
  // FOOTER
  // --------------------------------

  footer: {
    color: "#AAAAAA",
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
  },

});