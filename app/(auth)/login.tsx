import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { loginUser } from "../../src/api/authApi";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // -------------------------
    // VALIDATION
    // -------------------------

    if (!email.trim()) {
      Alert.alert(
        "Email Required",
        "Please enter your institutional email."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Password Required",
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      console.log("Attempting UniSecret login...");

      // -------------------------
      // CALL LOGIN API
      // -------------------------

      const response = await loginUser({
        email: email.trim(),
        password: password,
      });

      console.log("Login Response:", response);

      // -------------------------
      // GET TOKEN
      // -------------------------

      const token =
        response?.token ??
        response?.accessToken ??
        response?.data?.token ??
        response?.data?.accessToken;

      if (!token) {
        console.error(
          "Authentication token was not found.",
          response
        );

        Alert.alert(
          "Login Error",
          "The server did not return an authentication token."
        );

        return;
      }

      // -------------------------
      // SAVE TOKEN
      // -------------------------

      await AsyncStorage.setItem(
            "token",
            token
      );

      console.log("Token saved successfully.");

      // -------------------------
      // SAVE USER
      // -------------------------

      const user =
        response?.user ??
        response?.data?.user;

      if (user) {
        await AsyncStorage.setItem(
          "token",
          token
        );
      }

      // -------------------------
      // LOGIN SUCCESS
      // -------------------------

      Alert.alert(
        "Welcome to UniSecret!",
        "You have successfully logged in.",
        [
          {
            text: "Continue",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Login Error:", error);

      let message =
        "Unable to login. Please try again.";

      if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert(
        "Login Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* LOGO */}

            <View style={styles.logo}>
              <Text style={styles.logoText}>
                U
              </Text>
            </View>

            {/* TITLE */}

            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.subtitle}>
              Sign in to your UniSecret account
            </Text>

            {/* EMAIL */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Institutional Email
              </Text>

              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="student@university.edu"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* PASSWORD */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password
              </Text>

              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* LOGIN BUTTON */}

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.loginButtonText
                  }
                >
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* REGISTER */}

            <View
              style={
                styles.registerContainer
              }
            >
              <Text
                style={styles.registerText}
              >
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/register") //Error again: Argument of type '"/register"' is not assignable to parameter of type 'RelativePathString | ExternalPathString | "/modal" | `/modal?${string}` | `/modal#${string}` | "/_sitemap" | `/_sitemap?${string}` | `/_sitemap#${string}` | "/(tabs)" | "/(tabs)/create" | ... 51 more ... | { ...; }'.
                }
                disabled={loading}
              >
                <Text
                  style={styles.registerLink}
                >
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  container: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    height: 54,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 13,
    paddingHorizontal: 16,
    color: "#111111",
    fontSize: 15,
  },

  loginButton: {
    height: 54,
    borderRadius: 13,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  registerText: {
    color: "#6B7280",
    fontSize: 14,
  },

  registerLink: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 5,
  },
});