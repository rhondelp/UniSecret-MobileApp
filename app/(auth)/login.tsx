import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { loginUser } from "../../src/api/authApi";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your institutional email.");
      return;
    }

    if (!password) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({
        email: email.trim(),
        password: password,
      });

      await login(response);

      Alert.alert("Welcome to UniSecret!", "You have successfully logged in.", [
        {
          text: "Continue",
          onPress: () => {
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      console.error("Login Error:", error);
      let message = "Unable to login. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* HERO BRANDING */}
            <View style={styles.logo}>
              <Text style={styles.logoText}>U</Text>
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to your UniSecret account
            </Text>

            {/* INPUT FIELDS */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Institutional Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="student@university.edu"
                placeholderTextColor="#52525B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#52525B"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#0A0A0C" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* REGISTER LINK */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push("/register" as const)}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Create Account</Text>
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
    backgroundColor: "#0A0A0C",
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
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 36,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#16161A",
    borderWidth: 1.5,
    borderColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 28,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    color: "#EAB308",
    fontSize: 38,
    fontWeight: "900",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F4F4F5",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 36,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D4D4D8",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    height: 52,
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 14,
    paddingHorizontal: 16,
    color: "#F4F4F5",
    fontSize: 15,
  },
  loginButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: "#0A0A0C",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  registerText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  registerLink: {
    color: "#EAB308",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
});