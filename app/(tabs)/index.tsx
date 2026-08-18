import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import {
  Bell,
  MessageCircle,
  Plus,
  Sparkles,
  RefreshCw,
} from "lucide-react-native";

import {
  getConfessions,
  toggleLike,
  toggleSave,
  setReaction,
  Confession,
  ReactionType,
} from "../../src/api/confessionApi";

import { ConfessionCard } from "../../components/ConfessionCard";
import { ReactorsModal } from "../../components/ReactorsModal";

export default function HomeScreen() {
  // ============================================================
  // FEED STATE
  // ============================================================

  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // REACTION MODAL STATE
  // ============================================================

  const [selectedConfessionId, setSelectedConfessionId] =
    useState<number | null>(null);

  const [reactorsModalVisible, setReactorsModalVisible] =
    useState(false);

  // ============================================================
  // LOAD FEED
  // ============================================================

  useEffect(() => {
    loadConfessions();
  }, []);

  const loadConfessions = async () => {
    try {
      setError(null);

      const data = await getConfessions();

      if (Array.isArray(data)) {
        setConfessions(data);
      } else if (Array.isArray(data?.data)) {
        setConfessions(data.data);
      } else if (Array.isArray(data?.items)) {
        setConfessions(data.items);
      } else {
        setConfessions([]);
      }
    } catch (err) {
      console.error("Confessions API Error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to load confessions.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshFeed = async () => {
    setRefreshing(true);
    await loadConfessions();
  };

  // ============================================================
  // REACTION
  // ============================================================

  const handleSelectReaction = async (
    item: Confession,
    type: ReactionType
  ) => {
    const previousState = [...confessions];

    try {
      const response = await setReaction(
        item.id,
        "Confession",
        type
      );

      if (typeof response?.totalReactions === "number") {
        setConfessions((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  userReaction: response.userReaction,
                  isLiked: response.userReaction !== null,
                  likesCount: response.totalReactions,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Set Reaction Error:", err);

      setConfessions(previousState);

      Alert.alert(
        "Something went wrong",
        "Could not update your reaction."
      );
    }
  };

  // ============================================================
  // LIKE
  // ============================================================

  const handleToggleLike = async (item: Confession) => {
    const previousState = [...confessions];

    // Optimistic UI update
    setConfessions((prev) =>
      prev.map((c) => {
        if (c.id === item.id) {
          const newIsLiked = !c.isLiked;
          const currentCount = c.likesCount || 0;

          return {
            ...c,
            isLiked: newIsLiked,
            likesCount: newIsLiked
              ? currentCount + 1
              : Math.max(0, currentCount - 1),
          };
        }

        return c;
      })
    );

    try {
      const response = await toggleLike(
        item.id,
        "Confession"
      );

      if (typeof response?.totalLikes === "number") {
        setConfessions((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  isLiked: response.isLiked,
                  likesCount: response.totalLikes,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);

      setConfessions(previousState);

      Alert.alert(
        "Something went wrong",
        "Could not update like status."
      );
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleToggleSave = async (item: Confession) => {
    const previousState = [...confessions];

    // Optimistic UI update
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === item.id
          ? {
              ...c,
              isSaved: !c.isSaved,
            }
          : c
      )
    );

    try {
      const response = await toggleSave(item.id);

      if (typeof response?.isSaved === "boolean") {
        setConfessions((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? {
                  ...c,
                  isSaved: response.isSaved,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);

      setConfessions(previousState);

      Alert.alert(
        "Something went wrong",
        "Could not update save status."
      );
    }
  };

  // ============================================================
  // OPEN REACTORS
  // ============================================================

  const handleOpenReactors = (item: Confession) => {
    setSelectedConfessionId(item.id);
    setReactorsModalVisible(true);
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#09090B]"
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#09090B"
        />

        <View className="flex-1 items-center justify-center px-8">
          {/* Logo */}
          <View className="mb-5 h-[64px] w-[64px] items-center justify-center rounded-[22px] bg-[#EAB308]">
            <Sparkles
              size={28}
              color="#09090B"
              strokeWidth={2.5}
            />
          </View>

          <Text className="text-[18px] font-bold text-[#FAFAFA]">
            Loading your campus
          </Text>

          <Text className="mt-2 text-center text-[13px] leading-5 text-[#71717A]">
            Bringing the latest anonymous stories to your feed.
          </Text>

          <ActivityIndicator
            size="small"
            color="#EAB308"
            className="mt-5"
          />
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // ERROR SCREEN
  // ============================================================

  if (error) {
    return (
      <SafeAreaView
        className="flex-1 bg-[#09090B]"
        edges={["top", "bottom"]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#09090B"
        />

        <View className="flex-1 items-center justify-center px-8">
          {/* Error Icon */}
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full border border-[#29292D] bg-[#151517]">
            <RefreshCw
              size={28}
              color="#EAB308"
              strokeWidth={1.8}
            />
          </View>

          <Text className="mt-6 text-center text-[22px] font-extrabold text-[#FAFAFA]">
            Something went wrong
          </Text>

          <Text className="mt-2 max-w-[320px] text-center text-[13px] leading-5 text-[#71717A]">
            We couldn't load the campus feed right now. Check your
            connection and try again.
          </Text>

          {/* Retry */}
          <TouchableOpacity
            onPress={loadConfessions}
            activeOpacity={0.82}
            className="mt-7 h-[48px] flex-row items-center rounded-[15px] bg-[#EAB308] px-6"
          >
            <RefreshCw
              size={16}
              color="#09090B"
              strokeWidth={2.5}
            />

            <Text className="ml-2 text-[14px] font-extrabold text-[#09090B]">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // MAIN SCREEN
  // ============================================================

  return (
    <SafeAreaView
      className="flex-1 bg-[#09090B]"
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#09090B"
      />

      {/* ========================================================
          HEADER
      ======================================================== */}

      <View className="border-b border-[#1F1F23] bg-[#09090B]">
        {/* TOP HEADER */}
        <View className="flex-row items-center justify-between px-5 pb-4 pt-3">
          {/* BRAND */}
          <View className="flex-row items-center">
            {/* Logo */}
            <View className="h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-[#EAB308]">
              <Text className="text-[20px] font-black text-[#09090B]">
                U
              </Text>
            </View>

            {/* Brand Text */}
            <View className="ml-3">
              <Text className="text-[18px] font-extrabold tracking-[-0.4px] text-[#FAFAFA]">
                Uni
                <Text className="text-[#EAB308]">
                  Secret
                </Text>
              </Text>

              {/* Online Indicator */}
              <View className="mt-0.5 flex-row items-center">
                <View className="mr-1.5 h-[5px] w-[5px] rounded-full bg-[#22C55E]" />

                <Text className="text-[10px] font-medium text-[#71717A]">
                  Campus community
                </Text>
              </View>
            </View>
          </View>

          {/* NOTIFICATIONS */}
          <TouchableOpacity
            onPress={() =>
              router.push("/(tabs)/notifications")
            }
            activeOpacity={0.75}
            className="h-[42px] w-[42px] items-center justify-center rounded-[14px] border border-[#27272A] bg-[#151517]"
          >
            <Bell
              size={20}
              color="#D4D4D8"
              strokeWidth={1.9}
            />

            {/* Notification Indicator */}
            <View className="absolute right-[10px] top-[9px] h-[6px] w-[6px] rounded-full bg-[#EAB308]" />
          </TouchableOpacity>
        </View>

        {/* ======================================================
            FEED TITLE
        ====================================================== */}

        <View className="px-5 pb-4">
          <Text className="text-[25px] font-black tracking-[-0.7px] text-[#FAFAFA]">
            Campus feed
          </Text>

          <Text className="mt-1 text-[12px] text-[#71717A]">
            What's on everyone's mind?
          </Text>
        </View>
      </View>

      {/* ========================================================
          FEED
      ======================================================== */}

      <FlatList
        data={confessions}
        renderItem={({ item }) => (
          <ConfessionCard
            item={item}
            onToggleLike={handleToggleLike}
            onSelectReaction={handleSelectReaction}
            onToggleSave={handleToggleSave}
            onPressReactionsCount={handleOpenReactors}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 14,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
            tintColor="#EAB308"
            colors={["#EAB308"]}
            progressBackgroundColor="#151517"
          />
        }
        ListEmptyComponent={
          <View className="items-center px-8 pt-[95px]">
            {/* Empty Icon */}
            <View className="h-[76px] w-[76px] items-center justify-center rounded-[26px] border border-[#29292D] bg-[#151517]">
              <MessageCircle
                size={32}
                color="#EAB308"
                strokeWidth={1.7}
              />
            </View>

            <Text className="mt-6 text-center text-[21px] font-extrabold text-[#FAFAFA]">
              It's quiet here.
            </Text>

            <Text className="mt-2 max-w-[300px] text-center text-[13px] leading-5 text-[#71717A]">
              Start the conversation. Share something anonymously
              with your campus.
            </Text>

            {/* Create First Confession */}
            <TouchableOpacity
              onPress={() =>
                router.push("/(tabs)/create")
              }
              activeOpacity={0.82}
              className="mt-6 flex-row items-center rounded-[14px] bg-[#1D1A0E] px-5 py-3"
            >
              <Plus
                size={16}
                color="#EAB308"
                strokeWidth={2.5}
              />

              <Text className="ml-2 text-[13px] font-bold text-[#EAB308]">
                Share your first confession
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ========================================================
          FLOATING ACTION BUTTON
      ======================================================== */}

      <View className="absolute bottom-5 right-5">
        {/* Subtle Glow */}
        <View className="absolute -inset-2 rounded-full bg-[#EAB308]/10" />

        <TouchableOpacity
          onPress={() =>
            router.push("/(tabs)/create")
          }
          activeOpacity={0.85}
          className="h-[58px] w-[58px] items-center justify-center rounded-full bg-[#EAB308]"
        >
          <Plus
            size={28}
            color="#09090B"
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>

      {/* ========================================================
          REACTORS MODAL
      ======================================================== */}

      <ReactorsModal
        visible={reactorsModalVisible}
        reactableId={selectedConfessionId || 0}
        reactableType="Confession"
        onClose={() =>
          setReactorsModalVisible(false)
        }
      />
    </SafeAreaView>
  );
}