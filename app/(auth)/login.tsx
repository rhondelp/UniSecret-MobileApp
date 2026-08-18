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
      backgroundColor: focused ? "#18181B" : "#111113",
    };
  };

  // =========================
  // SCREEN
  // =========================

  return (
    <SafeAreaView
      className="flex-1 bg-[#09090B]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#09090B"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 30,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto w-full max-w-[500px] px-5">

            {/* =========================
                TOP BAR
            ========================= */}

            <View className="flex-row items-center justify-between pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
                activeOpacity={0.7}
                className="h-10 w-10 items-center justify-center rounded-full bg-[#141416]"
              >
                <Text className="mt-[-2px] text-[27px] font-light text-[#EAB308]">
                  ‹
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center">
                <View className="h-1.5 w-6 rounded-full bg-[#EAB308]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />
              </View>

              <View className="w-10" />
            </View>

            {/* =========================
                HERO
            ========================= */}

            <View className="mb-9 mt-10">
              {/* LOGO */}

              <View className="mb-6 h-[62px] w-[62px] items-center justify-center rounded-[19px] bg-[#EAB308]">
                <Text className="text-[31px] font-black text-[#09090B]">
                  U
                </Text>
              </View>

              {/* TITLE */}

              <Text className="text-[31px] font-extrabold tracking-[-1px] text-[#FAFAFA]">
                Welcome back.
              </Text>

              <Text className="mt-2.5 max-w-[330px] text-[14px] leading-[21px] text-[#71717A]">
                Sign in to continue to your anonymous university
                community.
              </Text>
            </View>

            {/* =========================
                LOGIN CARD
            ========================= */}

            <View className="rounded-[22px] border border-[#202024] bg-[#101012] p-5">

              {/* CARD HEADER */}

              <View className="mb-6">
                <Text className="text-[17px] font-bold text-[#FAFAFA]">
                  Sign in
                </Text>

                <Text className="mt-1 text-[12px] text-[#66666F]">
                  Use your university account credentials.
                </Text>
              </View>

              {/* =========================
                  EMAIL
              ========================= */}

              <View className="mb-5">
                <Text className="mb-2.5 text-[13px] font-semibold text-[#D4D4D8]">
                  Institutional Email
                </Text>

                <TextInput
                  className="h-[56px] rounded-[16px] border px-4 text-[16px] text-[#F4F4F5]"
                  style={getInputStyle("email")}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="student@university.edu"
                  placeholderTextColor="#52525B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  selectionColor="#EAB308"
                />
              </View>

              {/* =========================
                  PASSWORD
              ========================= */}

              <View className="mb-2">
                <Text className="mb-2.5 text-[13px] font-semibold text-[#D4D4D8]">
                  Password
                </Text>

                <TextInput
                  className="h-[56px] rounded-[16px] border px-4 text-[16px] text-[#F4F4F5]"
                  style={getInputStyle("password")}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#52525B"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  selectionColor="#EAB308"
                />
              </View>

              {/* =========================
                  SIGN IN BUTTON
              ========================= */}

              <TouchableOpacity
                className={`mt-6 h-[58px] flex-row items-center justify-center rounded-[17px] bg-[#EAB308] ${
                  loading ? "opacity-60" : "opacity-100"
                }`}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      color="#09090B"
                      size="small"
                    />

                    <Text className="ml-2.5 text-[15px] font-extrabold text-[#09090B]">
                      Signing in...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-[15px] font-extrabold tracking-wide text-[#09090B]">
                      Sign In
                    </Text>

                    <Text className="ml-2 text-[19px] font-bold text-[#09090B]">
                      →
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* =========================
                REGISTER
            ========================= */}

            <View className="mt-7 flex-row items-center justify-center">
              <Text className="text-[13px] text-[#71717A]">
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
                <Text className="text-[13px] font-bold text-[#EAB308]">
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* =========================
                FOOTER
            ========================= */}

            <Text className="mt-7 px-8 text-center text-[10px] leading-[16px] text-[#45454D]">
              Your university identity stays separate from
              your anonymous community activity.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================
          SWEET ALERT
      ========================= */}

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
