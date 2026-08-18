import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";

import { router } from "expo-router";

import { registerUser } from "../../src/api/authApi";
import { apiRequest } from "../../src/api/api";
import { useAuth } from "../../context/AuthContext";

type University = {
  id: number;
  name: string;
  domain: string;
  logoUrl?: string | null;
  status: string;
  createdAt?: string;
};

export default function RegisterScreen() {
  const { login } = useAuth();

  // =========================
  // FORM STATE
  // =========================

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // =========================
  // UNIVERSITY STATE
  // =========================

  const [universities, setUniversities] = useState<University[]>([]);

  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);

  const [loadingUniversities, setLoadingUniversities] = useState(true);

  // =========================
  // REGISTER LOADING
  // =========================

  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD UNIVERSITIES
  // =========================

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoadingUniversities(true);

      console.log("Loading universities...");

      const response = await apiRequest("/Universities");

      console.log("Universities response:", response);

      const data = Array.isArray(response)
        ? response
        : response?.data ?? [];

      setUniversities(data);
    } catch (error) {
      console.error("University API Error:", error);

      Alert.alert(
        "Unable to Load Universities",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoadingUniversities(false);
    }
  };

  // =========================
  // VALIDATE FORM
  // =========================

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return false;
    }

    if (!username.trim()) {
      Alert.alert("Missing Username", "Please enter a username.");
      return false;
    }

    if (username.trim().length < 3) {
      Alert.alert(
        "Invalid Username",
        "Username must contain at least 3 characters."
      );
      return false;
    }

    if (!selectedUniversity) {
      Alert.alert("University Required", "Please select your university.");
      return false;
    }

    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your institutional email.");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    if (!password) {
      Alert.alert("Missing Password", "Please create a password.");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must contain at least 6 characters."
      );
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Passwords Do Not Match",
        "Please make sure both passwords are the same."
      );
      return false;
    }

    return true;
  };

  // =========================
  // REGISTER USER
  // =========================

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const requestData = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        universityId: selectedUniversity!.id,
      };

      console.log("Register Request:", {
        ...requestData,
        password: "********",
      });

      const response = await registerUser(requestData);

      const hasToken =
        response?.token || response?.accessToken || response?.data?.token;

      if (hasToken) {
        await login(response);
      }

      Alert.alert(
        "Account Created!",
        "Your UniSecret account has been created successfully.",
        [
          {
            text: "Continue",
            onPress: () => {
              if (hasToken) {
                router.replace("/(tabs)");
              } else {
                router.replace("/login" as const);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Registration Error:", error);

      let message = "Unable to create your account.";

      if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert("Registration Failed", message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SCREEN
  // =========================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* BACK BUTTON */}

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          {/* LOGO */}

          <View style={styles.logo}>
            <Text style={styles.logoText}>U</Text>
          </View>

          {/* TITLE */}

          <Text style={styles.title}>Create your account</Text>

          <Text style={styles.subtitle}>
            Join your university community on UniSecret.
          </Text>

          {/* FULL NAME */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>

            <TextInput
              style={styles.input}
              placeholder="Juan Dela Cruz"
              placeholderTextColor="#52525B"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* USERNAME */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>

            <TextInput
              style={styles.input}
              placeholder="juan_delacruz"
              placeholderTextColor="#52525B"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.helper}>Used for @mentions.</Text>
          </View>

          {/* UNIVERSITY */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University</Text>

            {loadingUniversities ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#EAB308" />

                <Text style={styles.loadingText}>Loading universities...</Text>
              </View>
            ) : universities.length === 0 ? (
              <View style={styles.emptyUniversity}>
                <Text style={styles.emptyText}>No universities available.</Text>

                <TouchableOpacity onPress={loadUniversities} activeOpacity={0.7}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.universityList}>
                {universities.map((university) => {
                  const selected = selectedUniversity?.id === university.id;

                  return (
                    <TouchableOpacity
                      key={university.id}
                      style={[
                        styles.universityOption,
                        selected && styles.universityOptionSelected,
                      ]}
                      onPress={() => setSelectedUniversity(university)}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {/* RADIO */}

                      <View
                        style={[
                          styles.radio,
                          selected && styles.radioSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>

                      {/* UNIVERSITY INFO */}

                      <View style={styles.universityInfo}>
                        <Text style={styles.universityName}>
                          {university.name}
                        </Text>

                        <Text style={styles.universityDomain}>
                          {university.domain}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* EMAIL */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Institutional Email</Text>

            <TextInput
              style={styles.input}
              placeholder="student@university.edu"
              placeholderTextColor="#52525B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.helper}>Use your university-issued email.</Text>
          </View>

          {/* PASSWORD */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#52525B"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* CONFIRM PASSWORD */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Repeat your password"
              placeholderTextColor="#52525B"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* REGISTER BUTTON */}

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#0A0A0C" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>

            <TouchableOpacity
              onPress={() => router.replace("/login" as const)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0C",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 28,
  },
  backButton: {
    color: "#EAB308",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#16161A",
    borderWidth: 1.5,
    borderColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    color: "#EAB308",
    fontSize: 34,
    fontWeight: "900",
  },
  title: {
    color: "#F4F4F5",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#D4D4D8",
    fontSize: 13,
    fontWeight: "600",
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
  helper: {
    color: "#71717A",
    fontSize: 12,
    marginTop: 6,
  },
  loadingBox: {
    height: 55,
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#A1A1AA",
    fontSize: 13,
    marginLeft: 8,
  },
  emptyUniversity: {
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  retryText: {
    color: "#EAB308",
    fontWeight: "700",
    fontSize: 13,
    marginTop: 8,
  },
  universityList: {
    gap: 10,
  },
  universityOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 14,
    padding: 14,
  },
  universityOptionSelected: {
    borderColor: "#EAB308",
    backgroundColor: "#1C1C22",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#52525B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioSelected: {
    borderColor: "#EAB308",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EAB308",
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    color: "#F4F4F5",
    fontSize: 14,
    fontWeight: "700",
  },
  universityDomain: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },
  registerButton: {
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
  registerButtonText: {
    color: "#0A0A0C",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 20,
  },
  loginText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  loginLink: {
    color: "#EAB308",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
});