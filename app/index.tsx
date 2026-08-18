import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiRequest } from "../src/api/api";
import {
  ShieldCheck,
  GraduationCap,
  MessageSquareQuote,
  ArrowRight,
  Sparkles,
  Wifi,
  WifiOff,
  Lock,
} from "lucide-react-native";

export default function WelcomeScreen() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "failed"
  >("checking");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const bubble1 = useRef(new Animated.Value(20)).current;
  const bubble2 = useRef(new Animated.Value(-15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 45,
        friction: 8,
        useNativeDriver: true,
      }),

      Animated.spring(bubble1, {
        toValue: 0,
        tension: 35,
        friction: 7,
        useNativeDriver: true,
      }),

      Animated.spring(bubble2, {
        toValue: 0,
        tension: 35,
        friction: 7,
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
    <SafeAreaView className="flex-1 bg-[#080809]">
      <StatusBar barStyle="light-content" backgroundColor="#080809" />

      {/* ───────────── AMBIENT BACKGROUND ───────────── */}

      <View
        pointerEvents="none"
        className="absolute -right-[130px] top-[150px] h-[300px] w-[300px] rounded-full bg-[#EAB308]/[0.04]"
      />

      <View
        pointerEvents="none"
        className="absolute -left-[170px] bottom-[120px] h-[340px] w-[340px] rounded-full bg-[#EAB308]/[0.025]"
      />

      <Animated.View
        className="flex-1 px-5"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {/* ───────────── HEADER ───────────── */}

        <View className="flex-row items-center justify-between pt-2">
          <View className="flex-row items-center">
            <View className="h-[8px] w-[8px] rounded-full bg-[#EAB308]" />

            <Text className="ml-2 text-[10px] font-black uppercase tracking-[2px] text-[#71717A]">
              UniSecret
            </Text>
          </View>

          <View className="flex-row items-center rounded-full border border-[#27272A] bg-[#111113] px-3 py-1.5">
            {apiStatus === "checking" && (
              <>
                <ActivityIndicator size="small" color="#EAB308" />
                <Text className="ml-2 text-[9px] font-bold text-[#71717A]">
                  CONNECTING
                </Text>
              </>
            )}

            {apiStatus === "connected" && (
              <>
                <View className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                <Wifi size={11} color="#4ADE80" className="ml-1.5" />
                <Text className="ml-1.5 text-[9px] font-bold text-[#4ADE80]">
                  ONLINE
                </Text>
              </>
            )}

            {apiStatus === "failed" && (
              <>
                <View className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />
                <WifiOff size={11} color="#F87171" className="ml-1.5" />
                <Text className="ml-1.5 text-[9px] font-bold text-[#F87171]">
                  OFFLINE
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ───────────── HERO ───────────── */}

        <View className="mt-10">
          <View className="flex-row items-center">
            <View className="h-[45px] w-[45px] items-center justify-center rounded-[15px] bg-[#EAB308]">
              <Sparkles size={22} color="#080809" />
            </View>

            <View className="ml-3">
              <Text className="text-[10px] font-bold uppercase tracking-[1.8px] text-[#71717A]">
                Your campus
              </Text>

              <Text className="text-[12px] font-bold text-[#D4D4D8]">
                Your space
              </Text>
            </View>
          </View>

          <Text className="mt-8 text-[46px] font-black leading-[48px] tracking-[-2.5px] text-[#FAFAFA]">
            No names.
          </Text>

          <Text className="text-[46px] font-black leading-[48px] tracking-[-2.5px] text-[#FAFAFA]">
            No filters.
          </Text>

          <View className="mt-1 flex-row items-center">
            <Text className="text-[46px] font-black leading-[48px] tracking-[-2.5px] text-[#EAB308]">
              Just real talk.
            </Text>
          </View>

          <Text className="mt-5 max-w-[340px] text-[13px] leading-[20px] text-[#77777F]">
            Share what's on your mind, discover what your campus is really
            talking about, and stay completely anonymous.
          </Text>
        </View>

        {/* ───────────── FLOATING CONVERSATIONS ───────────── */}

        <View className="relative mt-8 h-[155px]">
          {/* Bubble 1 */}
          <Animated.View
            style={{
              transform: [{ translateY: bubble1 }],
            }}
            className="absolute left-0 top-0 w-[78%]"
          >
            <View className="rounded-[20px] rounded-bl-[6px] border border-[#303035] bg-[#151517] px-4 py-3.5">
              <View className="flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]/10">
                  <MessageSquareQuote size={14} color="#EAB308" />
                </View>

                <Text className="ml-2 text-[10px] font-bold text-[#71717A]">
                  ANONYMOUS
                </Text>
              </View>

              <Text className="mt-2 text-[12px] font-semibold leading-[17px] text-[#D4D4D8]">
                “Anyone else feel like finals came way too fast?”
              </Text>
            </View>
          </Animated.View>

          {/* Bubble 2 */}
          <Animated.View
            style={{
              transform: [{ translateY: bubble2 }],
            }}
            className="absolute right-0 top-[76px] w-[73%]"
          >
            <View className="rounded-[20px] rounded-br-[6px] border border-[#3D3210] bg-[#1A170C] px-4 py-3.5">
              <View className="flex-row items-center">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-[#EAB308]">
                  <GraduationCap size={14} color="#080809" />
                </View>

                <Text className="ml-2 text-[10px] font-bold text-[#A98C24]">
                  CAMPUS TALK
                </Text>
              </View>

              <Text className="mt-2 text-[12px] font-semibold leading-[17px] text-[#E7D89E]">
                “I finally found people who get it.”
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* ───────────── TRUST INDICATORS ───────────── */}

        <View className="mt-2 flex-row items-center">
          <View className="flex-row items-center">
            <ShieldCheck size={13} color="#EAB308" />

            <Text className="ml-1.5 text-[10px] font-semibold text-[#71717A]">
              Anonymous
            </Text>
          </View>

          <View className="mx-3 h-3 w-px bg-[#3F3F46]" />

          <View className="flex-row items-center">
            <Lock size={12} color="#EAB308" />

            <Text className="ml-1.5 text-[10px] font-semibold text-[#71717A]">
              Private
            </Text>
          </View>

          <View className="mx-3 h-3 w-px bg-[#3F3F46]" />

          <View className="flex-row items-center">
            <GraduationCap size={13} color="#EAB308" />

            <Text className="ml-1.5 text-[10px] font-semibold text-[#71717A]">
              Campus
            </Text>
          </View>
        </View>

        {/* ───────────── FLEX SPACE ───────────── */}

        <View className="flex-1" />

        {/* ───────────── CTA ───────────── */}

        <View className="pb-5 pt-6">
          <TouchableOpacity
            className="h-[58px] flex-row items-center justify-between rounded-[18px] bg-[#EAB308] px-5"
            activeOpacity={0.82}
            onPress={() => router.push("/login")}
            style={{
              shadowColor: "#EAB308",
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#080809]/10">
                <ArrowRight size={16} color="#080809" />
              </View>

              <Text className="ml-3 text-[15px] font-black text-[#080809]">
                Enter UniSecret
              </Text>
            </View>

            <Text className="text-[10px] font-bold uppercase tracking-[1px] text-[#715400]">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 h-[48px] items-center justify-center"
            activeOpacity={0.7}
            onPress={() => router.push("/register")}
          >
            <Text className="text-[12.5px] font-semibold text-[#71717A]">
              New to UniSecret?{" "}
              <Text className="font-bold text-[#E4E4E7]">
                Create an account
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}