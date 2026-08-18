import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { registerUser } from "../../src/api/authApi";
import { apiRequest } from "../../src/api/api";
import { useAuth } from "../../context/AuthContext";

import SweetAlert from "../../components/SweetAlert";

type University = {
  id: number;
  name: string;
  domain: string;
  logoUrl?: string | null;
  status: string;
  createdAt?: string;
};

type AlertType = "success" | "error" | "warning" | "info";

type FieldProps = TextInputProps & {
  label: string;
  input: string;
  value: string;
  onChangeText: (text: string) => void;
  loading: boolean;
  focusedInput: string | null;
  setFocusedInput: (input: string | null) => void;
};

function Field({
  label,
  input,
  value,
  onChangeText,
  loading,
  focusedInput,
  setFocusedInput,
  ...props
}: FieldProps) {
  const focused = focusedInput === input;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-[13px] font-semibold text-[#D4D4D8]">
        {label}
      </Text>

      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#52525B"
        editable={!loading}
        onFocus={() => setFocusedInput(input)}
        onBlur={() => setFocusedInput(null)}
        selectionColor="#EAB308"
        className="h-[55px] rounded-[15px] border px-4 text-[16px] text-[#F4F4F5]"
        style={{
          borderColor: focused ? "#EAB308" : "#27272A",
          backgroundColor: focused ? "#18181B" : "#111113",
        }}
      />
    </View>
  );
}

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

  const [loadingUniversities, setLoadingUniversities] =
    useState(true);

  // =========================
  // REGISTER LOADING
  // =========================

  const [loading, setLoading] = useState(false);

  // =========================
  // INPUT FOCUS
  // =========================

  const [focusedInput, setFocusedInput] =
    useState<string | null>(null);

  // =========================
  // SWEET ALERT STATE
  // =========================

  const [alertVisible, setAlertVisible] = useState(false);

  const [alertType, setAlertType] =
    useState<AlertType>("success");

  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtonText, setAlertButtonText] =
    useState("Continue");

  // =========================
  // REGISTRATION RESULT
  // =========================

  const [registrationHasToken, setRegistrationHasToken] =
    useState(false);

  // =========================
  // SWEET ALERT HELPER
  // =========================

  const showAlert = ({
    type,
    title,
    message,
    buttonText = "Continue",
  }: {
    type: AlertType;
    title: string;
    message: string;
    buttonText?: string;
  }) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertButtonText(buttonText);
    setAlertVisible(true);
  };

  // =========================
  // LOAD UNIVERSITIES
  // =========================

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoadingUniversities(true);

      const response = await apiRequest("/Universities");

      const data = Array.isArray(response)
        ? response
        : response?.data ?? [];

      setUniversities(data);
    } catch (error) {
      console.error("University API Error:", error);

      showAlert({
        type: "error",
        title: "Unable to Load Universities",
        message:
          error instanceof Error
            ? error.message
            : "Please try again.",
        buttonText: "Okay",
      });
    } finally {
      setLoadingUniversities(false);
    }
  };

  // =========================
  // VALIDATE FORM
  // =========================

  const validateForm = () => {
    if (!name.trim()) {
      showAlert({
        type: "warning",
        title: "Missing Name",
        message: "Please enter your full name.",
        buttonText: "Okay",
      });

      return false;
    }

    if (!username.trim()) {
      showAlert({
        type: "warning",
        title: "Missing Username",
        message: "Please enter a username.",
        buttonText: "Okay",
      });

      return false;
    }

    if (username.trim().length < 3) {
      showAlert({
        type: "warning",
        title: "Invalid Username",
        message:
          "Username must contain at least 3 characters.",
        buttonText: "Okay",
      });

      return false;
    }

    if (!selectedUniversity) {
      showAlert({
        type: "warning",
        title: "University Required",
        message: "Please select your university.",
        buttonText: "Okay",
      });

      return false;
    }

    if (!email.trim()) {
      showAlert({
        type: "warning",
        title: "Missing Email",
        message:
          "Please enter your institutional email.",
        buttonText: "Okay",
      });

      return false;
    }

    if (!email.includes("@")) {
      showAlert({
        type: "warning",
        title: "Invalid Email",
        message:
          "Please enter a valid email address.",
        buttonText: "Okay",
      });

      return false;
    }

    if (!password) {
      showAlert({
        type: "warning",
        title: "Missing Password",
        message: "Please create a password.",
        buttonText: "Okay",
      });

      return false;
    }

    if (password.length < 6) {
      showAlert({
        type: "warning",
        title: "Weak Password",
        message:
          "Password must contain at least 6 characters.",
        buttonText: "Okay",
      });

      return false;
    }

    if (password !== confirmPassword) {
      showAlert({
        type: "warning",
        title: "Passwords Do Not Match",
        message:
          "Please make sure both passwords are the same.",
        buttonText: "Okay",
      });

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

      const response = await registerUser(requestData);

      const hasToken =
        response?.token ||
        response?.accessToken ||
        response?.data?.token;

      if (hasToken) {
        await login(response);
      }

      setRegistrationHasToken(!!hasToken);

      showAlert({
        type: "success",
        title: "Account Created!",
        message:
          "Your UniSecret account has been created successfully.",
        buttonText: "Continue",
      });
    } catch (error) {
      console.error("Registration Error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account.";

      showAlert({
        type: "error",
        title: "Registration Failed",
        message,
        buttonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ALERT CONFIRM
  // =========================

  const handleAlertConfirm = () => {
    setAlertVisible(false);

    if (alertType === "success") {
      if (registrationHasToken) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login" as const);
      }

      return;
    }
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: 45,
          }}
        >
          <View className="mx-auto w-full max-w-[500px] px-5">

            {/* =========================
                TOP BAR
            ========================= */}

            <View className="flex-row items-center justify-between pt-3">
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

            <View className="mb-8 mt-8">
              <View className="mb-5 h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[#EAB308]">
                <Text className="text-[29px] font-black text-[#09090B]">
                  U
                </Text>
              </View>

              <Text className="text-[31px] font-extrabold tracking-[-1px] text-[#FAFAFA]">
                Welcome to
              </Text>

              <View className="flex-row items-center">
                <Text className="text-[31px] font-extrabold tracking-[-1px] text-[#FAFAFA]">
                  Uni
                </Text>

                <Text className="text-[31px] font-extrabold tracking-[-1px] text-[#EAB308]">
                  Secret
                </Text>
              </View>

              <Text className="mt-3 max-w-[340px] text-[14px] leading-[21px] text-[#71717A]">
                Create your anonymous university identity and
                connect with your campus community.
              </Text>
            </View>

            {/* =========================
                ACCOUNT CARD
            ========================= */}

            <View className="mb-4 rounded-[22px] border border-[#202024] bg-[#101012] p-5">
              <View className="mb-5">
                <Text className="text-[17px] font-bold text-[#FAFAFA]">
                  Your identity
                </Text>

                <Text className="mt-1 text-[12px] text-[#66666F]">
                  This information helps personalize your account.
                </Text>
              </View>

              <Field
                label="Full Name"
                input="name"
                value={name}
                onChangeText={setName}
                placeholder="Juan Dela Cruz"
                loading={loading}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />

              <View className="mb-1">
                <Field
                  label="Username"
                  input="username"
                  value={username}
                  onChangeText={setUsername}
                  placeholder="juan_delacruz"
                  autoCapitalize="none"
                  autoCorrect={false}
                  loading={loading}
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                />
              </View>

              <Text className="mt-[-10px] text-[11px] text-[#55555D]">
                Your username will be used for @mentions.
              </Text>
            </View>

            {/* =========================
                UNIVERSITY
            ========================= */}

            <View className="mb-4 rounded-[22px] border border-[#202024] bg-[#101012] p-5">
              <View className="mb-5">
                <Text className="text-[17px] font-bold text-[#FAFAFA]">
                  Your university
                </Text>

                <Text className="mt-1 text-[12px] text-[#66666F]">
                  Choose the campus community you belong to.
                </Text>
              </View>

              {loadingUniversities ? (
                <View className="h-[70px] flex-row items-center justify-center rounded-[16px] bg-[#151517]">
                  <ActivityIndicator
                    color="#EAB308"
                    size="small"
                  />

                  <Text className="ml-3 text-[13px] text-[#71717A]">
                    Loading universities...
                  </Text>
                </View>
              ) : universities.length === 0 ? (
                <View className="rounded-[16px] bg-[#151517] p-5">
                  <Text className="text-center text-[13px] text-[#71717A]">
                    No universities are currently available.
                  </Text>

                  <TouchableOpacity
                    onPress={loadUniversities}
                    activeOpacity={0.7}
                    className="mt-4 self-center rounded-full bg-[#211F16] px-5 py-2.5"
                  >
                    <Text className="text-[12px] font-bold text-[#EAB308]">
                      Retry
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="gap-2.5">
                  {universities.map((university) => {
                    const selected =
                      selectedUniversity?.id === university.id;

                    return (
                      <TouchableOpacity
                        key={university.id}
                        onPress={() =>
                          setSelectedUniversity(university)
                        }
                        disabled={loading}
                        activeOpacity={0.75}
                        className={`min-h-[72px] flex-row items-center rounded-[16px] border px-3.5 ${
                          selected
                            ? "border-[#EAB308] bg-[#1B190F]"
                            : "border-[#27272A] bg-[#151517]"
                        }`}
                      >
                        <View
                          className={`h-[42px] w-[42px] items-center justify-center rounded-[12px] ${
                            selected
                              ? "bg-[#EAB308]"
                              : "bg-[#232326]"
                          }`}
                        >
                          <Text
                            className={`text-[16px] font-extrabold ${
                              selected
                                ? "text-[#09090B]"
                                : "text-[#A1A1AA]"
                            }`}
                          >
                            {university.name
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </Text>
                        </View>

                        <View className="ml-3 flex-1 pr-3">
                          <Text
                            numberOfLines={1}
                            className="text-[14px] font-bold text-[#F4F4F5]"
                          >
                            {university.name}
                          </Text>

                          <Text
                            numberOfLines={1}
                            className="mt-1 text-[11px] text-[#71717A]"
                          >
                            {university.domain}
                          </Text>
                        </View>

                        <View
                          className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                            selected
                              ? "border-[#EAB308]"
                              : "border-[#3F3F46]"
                          }`}
                        >
                          {selected && (
                            <View className="h-2.5 w-2.5 rounded-full bg-[#EAB308]" />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* =========================
                CONTACT
            ========================= */}

            <View className="mb-4 rounded-[22px] border border-[#202024] bg-[#101012] p-5">
              <View className="mb-5">
                <Text className="text-[17px] font-bold text-[#FAFAFA]">
                  Contact
                </Text>

                <Text className="mt-1 text-[12px] text-[#66666F]">
                  Use your official university email.
                </Text>
              </View>

              <Field
                label="Institutional Email"
                input="email"
                value={email}
                onChangeText={setEmail}
                placeholder="student@university.edu"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                loading={loading}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />
            </View>

            {/* =========================
                SECURITY
            ========================= */}

            <View className="mb-5 rounded-[22px] border border-[#202024] bg-[#101012] p-5">
              <View className="mb-5">
                <Text className="text-[17px] font-bold text-[#FAFAFA]">
                  Secure your account
                </Text>

                <Text className="mt-1 text-[12px] text-[#66666F]">
                  Create a password with at least 6 characters.
                </Text>
              </View>

              <Field
                label="Password"
                input="password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                loading={loading}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />

              <Field
                label="Confirm Password"
                input="confirmPassword"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat your password"
                secureTextEntry
                loading={loading}
                focusedInput={focusedInput}
                setFocusedInput={setFocusedInput}
              />
            </View>

            {/* =========================
                CREATE ACCOUNT
            ========================= */}

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.82}
              className={`h-[60px] flex-row items-center justify-center rounded-[18px] bg-[#EAB308] ${
                loading ? "opacity-60" : ""
              }`}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    color="#09090B"
                    size="small"
                  />

                  <Text className="ml-2.5 text-[15px] font-extrabold text-[#09090B]">
                    Creating account...
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-[15px] font-extrabold tracking-wide text-[#09090B]">
                    Create Account
                  </Text>

                  <Text className="ml-2 text-[19px] font-bold text-[#09090B]">
                    →
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* =========================
                LOGIN
            ========================= */}

            <View className="mt-7 flex-row items-center justify-center">
              <Text className="text-[13px] text-[#71717A]">
                Already part of UniSecret?
              </Text>

              <TouchableOpacity
                onPress={() =>
                  router.replace("/login" as const)
                }
                disabled={loading}
                activeOpacity={0.7}
                className="ml-1.5 px-1"
              >
                <Text className="text-[13px] font-bold text-[#EAB308]">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* =========================
                FOOTER
            ========================= */}

            <Text className="mt-5 px-6 text-center text-[10px] leading-[16px] text-[#45454D]">
              By creating an account, you can participate in
              your university community through UniSecret.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================
          SWEET ALERT
      ========================= */}

      <SweetAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={alertButtonText}
        onConfirm={handleAlertConfirm}
      />
    </SafeAreaView>
  );
}