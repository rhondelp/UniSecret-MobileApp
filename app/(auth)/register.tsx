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

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  GraduationCap,
  Mail,
  LockKeyhole,
  UserRound,
  AtSign,
  ShieldCheck,
  Sparkles,
} from "lucide-react-native";

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
  icon?: React.ReactNode;
};

function Field({
  label,
  input,
  value,
  onChangeText,
  loading,
  focusedInput,
  setFocusedInput,
  icon,
  ...props
}: FieldProps) {
  const focused = focusedInput === input;

  return (
    <View className="mb-5">
      <Text className="mb-2.5 ml-1 text-[10px] font-bold uppercase tracking-[1.2px] text-[#71717A]">
        {label}
      </Text>

      <View className="relative">
        {icon && (
          <View className="absolute left-4 top-[19px] z-10">
            {icon}
          </View>
        )}

        <TextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#45454D"
          editable={!loading}
          onFocus={() => setFocusedInput(input)}
          onBlur={() => setFocusedInput(null)}
          selectionColor="#EAB308"
          className={`h-[58px] rounded-[17px] border text-[15px] text-[#F4F4F5] ${
            icon ? "pl-12 pr-4" : "px-4"
          }`}
          style={{
            borderColor: focused ? "#EAB308" : "#27272A",
            backgroundColor: focused ? "#151518" : "#101012",
          }}
        />
      </View>
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
        className="absolute -right-[150px] top-[100px] h-[320px] w-[320px] rounded-full bg-[#EAB308]/[0.035]"
      />

      <View
        pointerEvents="none"
        className="absolute -left-[180px] bottom-[-120px] h-[360px] w-[360px] rounded-full bg-[#EAB308]/[0.025]"
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
                <View className="h-1.5 w-10 rounded-full bg-[#EAB308]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />

                <View className="ml-1.5 h-1.5 w-1.5 rounded-full bg-[#3F3F46]" />
              </View>

              <View className="w-11" />
            </View>

            {/* ───────────────── HERO ───────────────── */}

            <View className="mt-9">
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
                    Get started
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
                Create your
              </Text>

              <Text className="text-[38px] font-black leading-[42px] tracking-[-1.8px] text-[#EAB308]">
                anonymous identity.
              </Text>

              <Text className="mt-4 max-w-[350px] text-[13px] leading-[20px] text-[#71717A]">
                Join your university community and have
                conversations without putting your real identity
                on display.
              </Text>
            </View>

            {/* ───────────────── PRIVACY STRIP ───────────────── */}

            <View className="mt-7 flex-row items-center rounded-[17px] border border-[#27272A] bg-[#101012] px-4 py-3.5">
              <View className="h-9 w-9 items-center justify-center rounded-[11px] bg-[#EAB308]/10">
                <ShieldCheck
                  size={17}
                  color="#EAB308"
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[11px] font-bold text-[#D4D4D8]">
                  Your identity stays yours
                </Text>

                <Text className="mt-0.5 text-[9.5px] leading-[14px] text-[#5F5F67]">
                  Your university details are used for verification,
                  not public identity.
                </Text>
              </View>
            </View>

            {/* ───────────────── SECTION 01 ───────────────── */}

            <View className="mt-8">

              <View className="mb-4 flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]">
                  <Text className="text-[10px] font-black text-[#080809]">
                    01
                  </Text>
                </View>

                <View className="ml-3">
                  <Text className="text-[16px] font-black text-[#F4F4F5]">
                    About you
                  </Text>

                  <Text className="text-[10px] text-[#5F5F67]">
                    Set up your campus identity
                  </Text>
                </View>
              </View>

              <View className="rounded-[22px] border border-[#202024] bg-[#101012] p-5">

                <Field
                  label="Full Name"
                  input="name"
                  value={name}
                  onChangeText={setName}
                  placeholder="Juan Dela Cruz"
                  loading={loading}
                  focusedInput={focusedInput}
                  setFocusedInput={setFocusedInput}
                  icon={
                    <UserRound
                      size={17}
                      color={
                        focusedInput === "name"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  }
                />

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
                  icon={
                    <AtSign
                      size={17}
                      color={
                        focusedInput === "username"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  }
                />

                <Text className="mt-[-12px] ml-1 text-[10px] text-[#55555D]">
                  Your username will be used for @mentions.
                </Text>
              </View>
            </View>

            {/* ───────────────── SECTION 02 ───────────────── */}

            <View className="mt-7">

              <View className="mb-4 flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]">
                  <Text className="text-[10px] font-black text-[#080809]">
                    02
                  </Text>
                </View>

                <View className="ml-3">
                  <Text className="text-[16px] font-black text-[#F4F4F5]">
                    Find your campus
                  </Text>

                  <Text className="text-[10px] text-[#5F5F67]">
                    Choose your university community
                  </Text>
                </View>
              </View>

              <View className="rounded-[22px] border border-[#202024] bg-[#101012] p-5">

                {selectedUniversity && (
                  <View className="mb-4 flex-row items-center rounded-[15px] border border-[#EAB308]/30 bg-[#1A170B] px-3.5 py-3">
                    <View className="h-9 w-9 items-center justify-center rounded-[11px] bg-[#EAB308]">
                      <Check
                        size={17}
                        color="#080809"
                        strokeWidth={3}
                      />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="text-[9px] font-bold uppercase tracking-[1px] text-[#A98B25]">
                        Selected campus
                      </Text>

                      <Text
                        numberOfLines={1}
                        className="mt-0.5 text-[12px] font-bold text-[#E4D89E]"
                      >
                        {selectedUniversity.name}
                      </Text>
                    </View>
                  </View>
                )}

                {loadingUniversities ? (
                  <View className="h-[100px] items-center justify-center rounded-[17px] border border-[#27272A] bg-[#151517]">
                    <ActivityIndicator
                      color="#EAB308"
                      size="small"
                    />

                    <Text className="mt-3 text-[11px] font-semibold text-[#71717A]">
                      Finding campuses...
                    </Text>
                  </View>
                ) : universities.length === 0 ? (
                  <View className="rounded-[17px] border border-[#27272A] bg-[#151517] p-5">
                    <Text className="text-center text-[12px] text-[#71717A]">
                      No universities are currently available.
                    </Text>

                    <TouchableOpacity
                      onPress={loadUniversities}
                      activeOpacity={0.7}
                      className="mt-4 self-center rounded-full bg-[#211F16] px-5 py-2.5"
                    >
                      <Text className="text-[11px] font-bold text-[#EAB308]">
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="gap-2.5">
                    {universities.map((university) => {
                      const selected =
                        selectedUniversity?.id ===
                        university.id;

                      return (
                        <TouchableOpacity
                          key={university.id}
                          onPress={() =>
                            setSelectedUniversity(university)
                          }
                          disabled={loading}
                          activeOpacity={0.75}
                          className={`min-h-[74px] flex-row items-center rounded-[17px] border px-3.5 ${
                            selected
                              ? "border-[#EAB308] bg-[#1B190F]"
                              : "border-[#27272A] bg-[#151517]"
                          }`}
                        >
                          <View
                            className={`h-[44px] w-[44px] items-center justify-center rounded-[13px] ${
                              selected
                                ? "bg-[#EAB308]"
                                : "bg-[#242427]"
                            }`}
                          >
                            <GraduationCap
                              size={19}
                              color={
                                selected
                                  ? "#080809"
                                  : "#71717A"
                              }
                            />
                          </View>

                          <View className="ml-3 flex-1 pr-3">
                            <Text
                              numberOfLines={1}
                              className={`text-[13px] font-bold ${
                                selected
                                  ? "text-[#F4E8A9]"
                                  : "text-[#E4E4E7]"
                              }`}
                            >
                              {university.name}
                            </Text>

                            <Text
                              numberOfLines={1}
                              className="mt-1 text-[10px] text-[#66666F]"
                            >
                              {university.domain}
                            </Text>
                          </View>

                          <View
                            className={`h-6 w-6 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[#EAB308] bg-[#EAB308]"
                                : "border-[#3F3F46]"
                            }`}
                          >
                            {selected && (
                              <Check
                                size={13}
                                color="#080809"
                                strokeWidth={3}
                              />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>

            {/* ───────────────── SECTION 03 ───────────────── */}

            <View className="mt-7">

              <View className="mb-4 flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]">
                  <Text className="text-[10px] font-black text-[#080809]">
                    03
                  </Text>
                </View>

                <View className="ml-3">
                  <Text className="text-[16px] font-black text-[#F4F4F5]">
                    Verify yourself
                  </Text>

                  <Text className="text-[10px] text-[#5F5F67]">
                    Use your official university email
                  </Text>
                </View>
              </View>

              <View className="rounded-[22px] border border-[#202024] bg-[#101012] p-5">

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
                  icon={
                    <Mail
                      size={17}
                      color={
                        focusedInput === "email"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  }
                />

                <View className="flex-row items-center rounded-[13px] bg-[#151517] px-3 py-2.5">
                  <ShieldCheck
                    size={13}
                    color="#71717A"
                  />

                  <Text className="ml-2 flex-1 text-[9.5px] leading-[14px] text-[#5F5F67]">
                    Your institutional email is used to verify
                    that you belong to the selected campus.
                  </Text>
                </View>
              </View>
            </View>

            {/* ───────────────── SECTION 04 ───────────────── */}

            <View className="mt-7">

              <View className="mb-4 flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]">
                  <Text className="text-[10px] font-black text-[#080809]">
                    04
                  </Text>
                </View>

                <View className="ml-3">
                  <Text className="text-[16px] font-black text-[#F4F4F5]">
                    Secure your account
                  </Text>

                  <Text className="text-[10px] text-[#5F5F67]">
                    Create your private login credentials
                  </Text>
                </View>
              </View>

              <View className="rounded-[22px] border border-[#202024] bg-[#101012] p-5">

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
                  icon={
                    <LockKeyhole
                      size={17}
                      color={
                        focusedInput === "password"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  }
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
                  icon={
                    <LockKeyhole
                      size={17}
                      color={
                        focusedInput === "confirmPassword"
                          ? "#EAB308"
                          : "#52525B"
                      }
                    />
                  }
                />

                <View className="flex-row items-center rounded-[13px] bg-[#151517] px-3 py-2.5">
                  <LockKeyhole
                    size={12}
                    color="#71717A"
                  />

                  <Text className="ml-2 text-[9.5px] text-[#5F5F67]">
                    Password must contain at least 6 characters.
                  </Text>
                </View>
              </View>
            </View>

            {/* ───────────────── FINAL CTA ───────────────── */}

            <View className="mt-8">
              <TouchableOpacity
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.82}
                className={`h-[61px] flex-row items-center justify-between rounded-[19px] bg-[#EAB308] px-5 ${
                  loading ? "opacity-60" : ""
                }`}
                style={{
                  shadowColor: "#EAB308",
                  shadowOffset: {
                    width: 0,
                    height: 8,
                  },
                  shadowOpacity: 0.18,
                  shadowRadius: 15,
                  elevation: 8,
                }}
              >
                {loading ? (
                  <View className="w-full flex-row items-center justify-center">
                    <ActivityIndicator
                      color="#080809"
                      size="small"
                    />

                    <Text className="ml-2.5 text-[14px] font-extrabold text-[#080809]">
                      Creating account...
                    </Text>
                  </View>
                ) : (
                  <>
                    <View>
                      <Text className="text-[9px] font-bold uppercase tracking-[1.2px] text-[#735600]">
                        Join your campus
                      </Text>

                      <Text className="mt-0.5 text-[15px] font-black text-[#080809]">
                        Create Account
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

            {/* ───────────────── LOGIN ───────────────── */}

            <View className="mt-7 flex-row items-center justify-center">
              <Text className="text-[12px] text-[#66666F]">
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
                <Text className="text-[12px] font-bold text-[#EAB308]">
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>

            {/* ───────────────── FOOTER ───────────────── */}

            <View className="mt-6 flex-row items-center justify-center">
              <ShieldCheck size={12} color="#45454D" />

              <Text className="ml-1.5 text-center text-[9.5px] leading-[15px] text-[#45454D]">
                Verified campus access · Anonymous community identity
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ───────────────── SWEET ALERT ───────────────── */}

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