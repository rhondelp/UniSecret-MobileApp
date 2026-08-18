import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  searchConfessions,
  getCategories,
  getTrendingHashtags,
  toggleLike,
  toggleSave,
  Confession,
  Category,
  Hashtag,
} from "../../src/api/confessionApi";

import { ConfessionCard } from "../../components/ConfessionCard";
import { useAuth } from "../../context/AuthContext";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);
  const [selectedTag, setSelectedTag] =
    useState<string | null>(null);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [trendingHashtags, setTrendingHashtags] =
    useState<Hashtag[]>([]);

  const [results, setResults] =
    useState<Confession[]>([]);

  const [loading, setLoading] =
    useState(false);

  const { user } = useAuth();

  // =========================
  // LOAD SEARCH METADATA
  // =========================

  useEffect(() => {
    loadMetaData();
  }, []);

  const loadMetaData = async () => {
    try {
      const [cats, tags] = await Promise.all([
        getCategories().catch(() => []),
        getTrendingHashtags().catch(() => []),
      ]);

      setCategories(cats);
      setTrendingHashtags(tags);
    } catch (error) {
      console.error(
        "Error loading search metadata:",
        error
      );
    }
  };

  // =========================
  // SEARCH
  // =========================

  const executeSearch = useCallback(async () => {
    setLoading(true);

    try {
      const response = await searchConfessions({
        q: query.trim() || undefined,
        categoryId:
          selectedCategory ?? undefined,
        tag:
          selectedTag ?? undefined,
        universityId:
          user?.universityId ?? undefined,
      });

      if (Array.isArray(response)) {
        setResults(response);
      } else if (Array.isArray(response?.data)) {
        setResults(response.data);
      } else if (Array.isArray(response?.items)) {
        setResults(response.items);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(
        "Search failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    query,
    selectedCategory,
    selectedTag,
    user?.universityId,
  ]);

  // =========================
  // DEBOUNCED SEARCH
  // =========================

  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch();
    }, 400);

    return () => clearTimeout(handler);
  }, [executeSearch]);

  // =========================
  // LIKE
  // =========================

  const handleToggleLike = async (
    item: Confession
  ) => {
    const previousState = [...results];

    setResults((previous) =>
      previous.map((confession) => {
        if (confession.id !== item.id) {
          return confession;
        }

        const newIsLiked =
          !confession.isLiked;

        const currentCount =
          confession.likesCount || 0;

        return {
          ...confession,
          isLiked: newIsLiked,
          likesCount: newIsLiked
            ? currentCount + 1
            : Math.max(
                0,
                currentCount - 1
              ),
        };
      })
    );

    try {
      const response =
        await toggleLike(
          item.id,
          "Confession"
        );

      if (
        typeof response?.totalLikes ===
        "number"
      ) {
        setResults((previous) =>
          previous.map((confession) =>
            confession.id === item.id
              ? {
                  ...confession,
                  isLiked:
                    response.isLiked,
                  likesCount:
                    response.totalLikes,
                }
              : confession
          )
        );
      }
    } catch (error) {
      console.error(error);

      setResults(previousState);

      Alert.alert(
        "Error",
        "Could not update like status."
      );
    }
  };

  // =========================
  // SAVE
  // =========================

  const handleToggleSave = async (
    item: Confession
  ) => {
    const previousState = [...results];

    setResults((previous) =>
      previous.map((confession) =>
        confession.id === item.id
          ? {
              ...confession,
              isSaved:
                !confession.isSaved,
            }
          : confession
      )
    );

    try {
      const response =
        await toggleSave(item.id);

      if (
        typeof response?.isSaved ===
        "boolean"
      ) {
        setResults((previous) =>
          previous.map((confession) =>
            confession.id === item.id
              ? {
                  ...confession,
                  isSaved:
                    response.isSaved,
                }
              : confession
          )
        );
      }
    } catch (error) {
      console.error(error);

      setResults(previousState);

      Alert.alert(
        "Error",
        "Could not update save status."
      );
    }
  };

  // =========================
  // CLEAR SEARCH
  // =========================

  const clearSearch = () => {
    setQuery("");
  };

  // =========================
  // SCREEN
  // =========================

  return (
    <SafeAreaView
      className="flex-1 bg-[#09090B]"
      edges={["top"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#09090B"
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        {/* =========================
            HEADER
        ========================= */}

        <View className="border-b border-[#202024] bg-[#09090B] px-5 pb-4 pt-2">

          {/* BRAND ROW */}

          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-[25px] font-black tracking-[-1px] text-[#FAFAFA]">
                Uni
                <Text className="text-[#EAB308]">
                  Secret
                </Text>
              </Text>

              <Text className="mt-0.5 text-[11px] font-medium text-[#71717A]">
                Discover campus stories
              </Text>
            </View>

            <View className="h-9 w-9 items-center justify-center rounded-[12px] border border-[#27272A] bg-[#141416]">
              <Text className="text-[17px] text-[#EAB308]">
                ⌕
              </Text>
            </View>
          </View>

          {/* SEARCH FIELD */}

          <View className="h-[54px] flex-row items-center rounded-[17px] border border-[#2A2A2F] bg-[#141416] px-4">

            <Text className="mr-3 text-[20px] text-[#71717A]">
              ⌕
            </Text>

            <TextInput
              className="flex-1 text-[15px] text-[#F4F4F5]"
              placeholder="Search stories, topics, tags..."
              placeholderTextColor="#52525B"
              value={query}
              onChangeText={setQuery}
              clearButtonMode="while-editing"
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />

            {query.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                activeOpacity={0.7}
                className="ml-2 h-7 w-7 items-center justify-center rounded-full bg-[#27272A]"
              >
                <Text className="text-[13px] font-bold text-[#A1A1AA]">
                  ×
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* =========================
            FILTER AREA
        ========================= */}

        <View className="border-b border-[#202024] bg-[#101012]">

          {/* TRENDING */}

          {trendingHashtags.length > 0 && (
            <View className="py-3">

              <View className="mb-2.5 flex-row items-center px-5">
                <Text className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#71717A]">
                  Trending
                </Text>

                <View className="ml-2 h-1.5 w-1.5 rounded-full bg-[#EAB308]" />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingHorizontal: 16,
                }}
              >
                {trendingHashtags.map(
                  (hashtag) => {
                    const active =
                      selectedTag ===
                      hashtag.tag;

                    return (
                      <TouchableOpacity
                        key={hashtag.id}
                        onPress={() =>
                          setSelectedTag(
                            active
                              ? null
                              : hashtag.tag
                          )
                        }
                        activeOpacity={0.75}
                        className={`mr-2 rounded-full border px-3.5 py-2 ${
                          active
                            ? "border-[#EAB308] bg-[#EAB308]"
                            : "border-[#2F2F35] bg-[#18181B]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] ${
                            active
                              ? "font-extrabold text-[#09090B]"
                              : "font-semibold text-[#A1A1AA]"
                          }`}
                        >
                          #{hashtag.tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </ScrollView>
            </View>
          )}

          {/* CATEGORIES */}

          {categories.length > 0 && (
            <View className="border-t border-[#1F1F23] py-3">

              <View className="mb-2.5 flex-row items-center px-5">
                <Text className="text-[11px] font-extrabold uppercase tracking-[1px] text-[#71717A]">
                  Categories
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingHorizontal: 16,
                }}
              >
                {/* ALL */}

                <TouchableOpacity
                  onPress={() =>
                    setSelectedCategory(
                      null
                    )
                  }
                  activeOpacity={0.75}
                  className={`mr-2 rounded-full border px-4 py-2 ${
                    selectedCategory ===
                    null
                      ? "border-[#EAB308] bg-[#EAB308]"
                      : "border-[#2F2F35] bg-[#18181B]"
                  }`}
                >
                  <Text
                    className={`text-[12px] ${
                      selectedCategory ===
                      null
                        ? "font-extrabold text-[#09090B]"
                        : "font-semibold text-[#A1A1AA]"
                    }`}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                {categories.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category.id;

                    return (
                      <TouchableOpacity
                        key={category.id}
                        onPress={() =>
                          setSelectedCategory(
                            active
                              ? null
                              : category.id
                          )
                        }
                        activeOpacity={0.75}
                        className={`mr-2 rounded-full border px-4 py-2 ${
                          active
                            ? "border-[#EAB308] bg-[#EAB308]"
                            : "border-[#2F2F35] bg-[#18181B]"
                        }`}
                      >
                        <Text
                          className={`text-[12px] ${
                            active
                              ? "font-extrabold text-[#09090B]"
                              : "font-semibold text-[#A1A1AA]"
                          }`}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                )}
              </ScrollView>
            </View>
          )}
        </View>

        {/* =========================
            RESULTS HEADER
        ========================= */}

        <View className="flex-row items-center justify-between px-5 pb-2 pt-4">

          <View>
            <Text className="text-[14px] font-extrabold text-[#F4F4F5]">
              {query.trim() ||
              selectedTag ||
              selectedCategory !== null
                ? "Search results"
                : "Campus stories"}
            </Text>

            {!loading &&
              results.length > 0 && (
                <Text className="mt-0.5 text-[11px] text-[#52525B]">
                  {results.length}{" "}
                  {results.length === 1
                    ? "story"
                    : "stories"}{" "}
                  found
                </Text>
              )}
          </View>

          {(selectedTag !== null ||
            selectedCategory !== null) && (
            <TouchableOpacity
              onPress={() => {
                setSelectedTag(null);
                setSelectedCategory(
                  null
                );
              }}
              activeOpacity={0.7}
              className="rounded-full bg-[#211F16] px-3 py-1.5"
            >
              <Text className="text-[11px] font-bold text-[#EAB308]">
                Clear filters
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* =========================
            RESULTS
        ========================= */}

        {loading ? (
          <View className="flex-1 items-center justify-center">

            <View className="h-[64px] w-[64px] items-center justify-center rounded-[20px] border border-[#27272A] bg-[#141416]">
              <ActivityIndicator
                color="#EAB308"
                size="small"
              />
            </View>

            <Text className="mt-4 text-[12px] font-medium text-[#71717A]">
              Searching campus stories...
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            renderItem={({ item }) => (
              <ConfessionCard
                item={item}
                onToggleLike={
                  handleToggleLike
                }
                onToggleSave={
                  handleToggleSave
                }
              />
            )}
            keyExtractor={(item) =>
              item.id.toString()
            }
            contentContainerStyle={{
              paddingHorizontal: 14,
              paddingTop: 8,
              paddingBottom: 110,
            }}
            showsVerticalScrollIndicator={
              false
            }
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center px-8 pt-[70px]">

                <View className="h-[72px] w-[72px] items-center justify-center rounded-[24px] border border-[#27272A] bg-[#141416]">
                  <Text className="text-[28px] text-[#EAB308]">
                    ⌕
                  </Text>
                </View>

                <Text className="mt-5 text-[18px] font-extrabold text-[#F4F4F5]">
                  No stories found
                </Text>

                <Text className="mt-2 text-center text-[13px] leading-[20px] text-[#71717A]">
                  Try different keywords,
                  hashtags, or categories to
                  discover more from your
                  campus.
                </Text>

                {(selectedTag !== null ||
                  selectedCategory !==
                    null ||
                  query.trim()) && (
                  <TouchableOpacity
                    onPress={() => {
                      setQuery("");
                      setSelectedTag(
                        null
                      );
                      setSelectedCategory(
                        null
                      );
                    }}
                    activeOpacity={0.8}
                    className="mt-5 rounded-full bg-[#EAB308] px-5 py-2.5"
                  >
                    <Text className="text-[12px] font-extrabold text-[#09090B]">
                      Reset Search
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}