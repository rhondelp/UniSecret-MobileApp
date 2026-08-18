import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

import SweetAlert from "../../components/SweetAlert";

import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Mail,
  KeyRound,
  Sparkles,
} from "lucide-react-native";

export default function LoginScreen() {
  // =========================
  // FORM STATE
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // LOADING STATE
  // =========================

  const [loading, setLoading] = useState(false);

  // =========================
  // INPUT FOCUS STATE
  // =========================

  const [focusedInput, setFocusedInput] = useState<string | null>(
    null
  );

  // =========================
  // SWEET ALERT STATE
  // =========================

  const [showSuccess, setShowSuccess] = useState(false);

  // =========================
  // AUTH
  // =========================

  const { login } = useAuth();

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async () => {
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

      const response = await loginUser({
        email: email.trim(),
        password: password,
      });

      await login(response);

      // Show custom success alert
      setShowSuccess(true);
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

  // =========================
  // INPUT STYLE
  // =========================

  const getInputStyle = (input: string) => {
    const focused = focusedInput === input;

    return {
      borderColor: focused ? "#EAB308" : "#27272A",
      backgroundColor: focused ? "#151518" : "#101012",
    };
  };

  // =========================
  // SCREEN
  // =========================

  return (
    <SafeAreaView
      className="flex-1 bg-[#080809]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080809"
      />

      {/* ───────────────── BACKGROUND ───────────────── */}

      <View
        pointerEvents="none"
        className="absolute -right-[140px] top-[40px] h-[300px] w-[300px] rounded-full bg-[#EAB308]/[0.035]"
      />

      <View
        pointerEvents="none"
        className="absolute -left-[180px] bottom-[-100px] h-[350px] w-[350px] rounded-full bg-[#EAB308]/[0.025]"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto w-full max-w-[500px] px-5">

            {/* ───────────────── TOP BAR ───────────────── */}

            <View className="flex-row items-center justify-between pt-3">
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
                activeOpacity={0.7}
                className="h-11 w-11 items-center justify-center rounded-full border border-[#27272A] bg-[#111113]"
              >
                <ArrowLeft
                  size={19}
                  color="#D4D4D8"
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <View className="flex-row items-center">
                <View className="h-1.5 w-8 rounded-full bg-[#EAB308]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />
              </View>

              <View className="w-11" />
            </View>

            {/* ───────────────── BRAND / HERO ───────────────── */}

            <View className="mt-10">
              <View className="flex-row items-center">
                <View className="relative">
                  <View className="absolute -inset-2 rounded-[20px] bg-[#EAB308]/[0.06]" />

                  <View className="h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#EAB308]">
                    <Sparkles
                      size={25}
                      color="#080809"
                      strokeWidth={2.2}
                    />
                  </View>
                </View>

                <View className="ml-4">
                  <Text className="text-[10px] font-bold uppercase tracking-[2px] text-[#71717A]">
                    Welcome back
                  </Text>

                  <Text className="mt-0.5 text-[14px] font-bold text-[#E4E4E7]">
                    Uni
                    <Text className="text-[#EAB308]">
                      Secret
                    </Text>
                  </Text>
                </View>
              </View>

              <Text className="mt-8 text-[38px] font-black leading-[42px] tracking-[-1.8px] text-[#FAFAFA]">
                Your campus
              </Text>

              <Text className="text-[38px] font-black leading-[42px] tracking-[-1.8px] text-[#EAB308]">
                is waiting.
              </Text>

              <Text className="mt-4 max-w-[340px] text-[13px] leading-[20px] text-[#71717A]">
                Sign in with your university account and
                return to the conversation.
              </Text>
            </View>

            {/* ───────────────── TRUST STRIP ───────────────── */}

            <View className="mt-7 flex-row items-center rounded-[16px] border border-[#27272A] bg-[#101012] px-4 py-3">
              <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-[#EAB308]/10">
                <ShieldCheck size={16} color="#EAB308" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[11px] font-bold text-[#D4D4D8]">
                  Your identity stays private
                </Text>

                <Text className="mt-0.5 text-[9.5px] text-[#5F5F67]">
                  University verification never becomes your public identity.
                </Text>
              </View>

              <LockKeyhole size={15} color="#52525B" />
            </View>

            {/* ───────────────── FORM ───────────────── */}

            <View className="mt-7">

              {/* EMAIL */}

              <View className="mb-5">
                <Text className="mb-2.5 ml-1 text-[11px] font-bold uppercase tracking-[1.1px] text-[#71717A]">
                  Institutional Email
                </Text>

                <View className="relative">
                  <View className="absolute left-4 top-[19px] z-10">
                    <Mail
                      size={17}
                      color={
                        focusedInput === "email"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  </View>

                  <TextInput
                    className="h-[58px] rounded-[17px] border pl-12 pr-4 text-[15px] text-[#F4F4F5]"
                    style={getInputStyle("email")}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="student@university.edu"
                    placeholderTextColor="#45454D"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput(null)}
                    selectionColor="#EAB308"
                  />
                </View>
              </View>

              {/* PASSWORD */}

              <View>
                <Text className="mb-2.5 ml-1 text-[11px] font-bold uppercase tracking-[1.1px] text-[#71717A]">
                  Password
                </Text>

                <View className="relative">
                  <View className="absolute left-4 top-[19px] z-10">
                    <KeyRound
                      size={17}
                      color={
                        focusedInput === "password"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  </View>

                  <TextInput
                    className="h-[58px] rounded-[17px] border pl-12 pr-4 text-[15px] text-[#F4F4F5]"
                    style={getInputStyle("password")}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#45454D"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    selectionColor="#EAB308"
                  />
                </View>
              </View>

              {/* SIGN IN */}

              <TouchableOpacity
                className={`mt-7 h-[58px] flex-row items-center justify-between rounded-[18px] bg-[#EAB308] px-5 ${
                  loading ? "opacity-60" : "opacity-100"
                }`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.82}
                style={{
                  shadowColor: "#EAB308",
                  shadowOffset: {
                    width: 0,
                    height: 7,
                  },
                  shadowOpacity: 0.18,
                  shadowRadius: 14,
                  elevation: 7,
                }}
              >
                {loading ? (
                  <View className="w-full flex-row items-center justify-center">
                    <ActivityIndicator
                      color="#080809"
                      size="small"
                    />

                    <Text className="ml-2.5 text-[14px] font-extrabold text-[#080809]">
                      Signing in...
                    </Text>
                  </View>
                ) : (
                  <>
                    <View>
                      <Text className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#735600]">
                        Continue securely
                      </Text>

                      <Text className="mt-0.5 text-[15px] font-black text-[#080809]">
                        Sign In
                      </Text>
                    </View>

                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#080809]">
                      <ArrowRight
                        size={17}
                        color="#EAB308"
                        strokeWidth={2.5}
                      />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* ───────────────── REGISTER ───────────────── */}

            <View className="mt-7 flex-row items-center justify-center">
              <Text className="text-[12px] text-[#66666F]">
                New to UniSecret?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.push("/register" as const)
                }
                disabled={loading}
                activeOpacity={0.7}
                className="ml-1.5 rounded-md px-1"
              >
                <Text className="text-[12px] font-bold text-[#EAB308]">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* ───────────────── FOOTER ───────────────── */}

            <View className="mt-7 flex-row items-center justify-center">
              <ShieldCheck size={12} color="#45454D" />

              <Text className="ml-1.5 text-center text-[9.5px] leading-[15px] text-[#45454D]">
                Verified university access · Anonymous community identity
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ───────────────── SWEET ALERT ───────────────── */}

      <SweetAlert
        visible={showSuccess}
        type="success"
        title="Welcome back!"
        message="You have successfully logged in to UniSecret."
        buttonText="Continue"
        onConfirm={() => {
          setShowSuccess(false);
          router.replace("/(tabs)");
        }}
      />
    </SafeAreaView>
  );
}