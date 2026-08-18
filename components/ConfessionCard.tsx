import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";

import {
  Confession,
  ReactionType,
  getReactors,
  ReactionUser,
  normalizeImageUrl,
} from "../src/api/confessionApi";

import { ReactionPicker } from "./ReactionPicker";

type ConfessionCardProps = {
  item: Confession;

  onToggleLike: (
    item: Confession
  ) => void;

  onSelectReaction?: (
    item: Confession,
    type: ReactionType
  ) => void;

  onToggleSave: (
    item: Confession
  ) => void;

  onPressReactionsCount?: (
    item: Confession
  ) => void;

  onPressComment?: (
    item: Confession
  ) => void;

  onPressShare?: (
    item: Confession
  ) => void;

  onPressTag?: (
    tag: string
  ) => void;
};

// ============================================================
// REACTION MAP
// ============================================================

const EMOJI_MAP: Record<
  string | number,
  string
> = {
  0: "👍",
  1: "❤️",
  2: "😂",
  3: "😢",
  4: "😡",
  5: "😭",

  Like: "👍",
  Love: "❤️",
  Haha: "😂",
  Sad: "😢",
  Angry: "😡",
  Cry: "😭",
};

// ============================================================
// COMPONENT
// ============================================================

export const ConfessionCard: React.FC<
  ConfessionCardProps
> = ({
  item,
  onToggleLike,
  onSelectReaction,
  onToggleSave,
  onPressReactionsCount,
  onPressComment,
  onPressShare,
}) => {
  const [
    showPicker,
    setShowPicker,
  ] = useState(false);

  /**
   * Reactors
   */
  const [
    reactors,
    setReactors,
  ] = useState<ReactionUser[]>([]);

  const [
    loadingReactors,
    setLoadingReactors,
  ] = useState(false);

  // ==========================================================
  // IMAGE URL
  // ==========================================================

  const imageUrl = normalizeImageUrl(
    item.imageUrl
  );

  // ==========================================================
  // LOAD REACTORS
  // ==========================================================

  const loadReactors =
    useCallback(async () => {
      try {
        setLoadingReactors(true);

        const response =
          await getReactors(
            item.id,
            "Confession"
          );

        setReactors(
          Array.isArray(response)
            ? response
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load reactors:",
          error
        );
      } finally {
        setLoadingReactors(false);
      }
    }, [item.id]);

  // ==========================================================
  // INITIAL REACTOR LOAD
  // ==========================================================

  useEffect(() => {
    loadReactors();
  }, [loadReactors]);

  // ==========================================================
  // REFRESH WHEN REACTION STATE CHANGES
  // ==========================================================

  useEffect(() => {
    if (item.id) {
      loadReactors();
    }
  }, [
    item.id,
    item.likesCount,
    item.userReaction,
    loadReactors,
  ]);

  // ==========================================================
  // GET UNIQUE REACTION EMOJIS
  // ==========================================================

  const getDisplayEmojis =
    useCallback(() => {
      const uniqueTypes =
        new Set<string | number>();

      reactors.forEach(
        (reactor) => {
          if (
            reactor.type !== null &&
            reactor.type !== undefined
          ) {
            uniqueTypes.add(
              reactor.type
            );
          }
        }
      );

      return Array.from(
        uniqueTypes
      )
        .map(
          (type) =>
            EMOJI_MAP[type] ||
            ""
        )
        .filter(Boolean)
        .join("");
    }, [reactors]);

  const displayEmojis =
    getDisplayEmojis();

  // ==========================================================
  // COUNTS / STATE
  // ==========================================================

  const totalReactions =
    item.likesCount || 0;

  const isLikedActive =
    item.isLiked ||
    item.userReaction != null;

  // ==========================================================
  // PICK REACTION
  // ==========================================================

  const handlePickReaction =
    async (
      type: ReactionType
    ) => {
      setShowPicker(false);

      if (onSelectReaction) {
        await Promise.resolve(
          onSelectReaction(
            item,
            type
          )
        );

        setTimeout(() => {
          loadReactors();
        }, 250);
      } else {
        onToggleLike(item);

        setTimeout(() => {
          loadReactors();
        }, 250);
      }
    };

  // ==========================================================
  // NORMAL LIKE
  // ==========================================================

  const handleToggleLike =
    async () => {
      if (showPicker) {
        setShowPicker(false);
        return;
      }

      onToggleLike(item);

      setTimeout(() => {
        loadReactors();
      }, 250);
    };

  // ==========================================================
  // AVATAR LETTER
  // ==========================================================

  const avatarLetter =
    item.isAnonymous
      ? "?"
      : (
          item.user?.name ||
          item.authorName ||
          "A"
        )
          .charAt(0)
          .toUpperCase();

  // ==========================================================
  // DISPLAY NAME
  // ==========================================================

  const displayName =
    item.isAnonymous
      ? "Anonymous Student"
      : item.user?.name ||
        item.authorName ||
        "Anonymous User";

  // ==========================================================
  // CATEGORY NAME
  // ==========================================================

  /*
   * Your API response is:
   *
   * categoryName: "Love"
   *
   * not:
   *
   * category: {
   *   name: "Love"
   * }
   *
   * Support both.
   */
  const categoryName =
    item.categoryName ||
    item.category?.name ||
    null;

  // ==========================================================
  // USER REACTION EMOJI
  // ==========================================================

  const activeReaction =
    item.userReaction !==
      null &&
    item.userReaction !==
      undefined
      ? EMOJI_MAP[
          item.userReaction
        ] || "♥"
      : "♥";

  // ==========================================================
  // IMAGE ERROR
  // ==========================================================

  const handleImageError =
    (event: any) => {
      console.error(
        "CONFESSION IMAGE FAILED:",
        imageUrl
      );

      console.error(
        "IMAGE ERROR:",
        event?.nativeEvent
      );
    };

  // ==========================================================
  // IMAGE LOAD
  // ==========================================================

  const handleImageLoad = () => {
    console.log(
      "CONFESSION IMAGE LOADED:",
      imageUrl
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <View className="relative mb-4 overflow-visible rounded-[22px] border border-[#242428] bg-[#131315]">

      {/* ======================================================
          TOP ACCENT
      ====================================================== */}

      <View className="absolute left-0 right-0 top-0 h-[2px] rounded-full bg-[#EAB308]" />

      {/* ======================================================
          CARD CONTENT
      ====================================================== */}

      <View className="p-[17px]">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <View className="flex-row items-center">

          {/* AVATAR */}

          <View className="h-[45px] w-[45px] items-center justify-center rounded-[15px] border border-[#3A3A3F] bg-[#242428]">

            <Text className="text-[17px] font-black text-[#EAB308]">
              {avatarLetter}
            </Text>

          </View>

          {/* USER INFO */}

          <View className="ml-3 flex-1">

            <View className="flex-row items-center">

              <Text
                numberOfLines={1}
                className="max-w-[190px] text-[14px] font-bold text-[#F4F4F5]"
              >
                {displayName}
              </Text>

              {item.isAnonymous && (
                <View className="ml-2 rounded-full bg-[#211F16] px-2 py-[3px]">
                  <Text className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#EAB308]">
                    Anonymous
                  </Text>
                </View>
              )}

            </View>

            <Text className="mt-1 text-[11px] text-[#68686F]">
              {formatDate(
                item.createdAt
              )}
            </Text>

          </View>

          {/* MORE */}

          <TouchableOpacity
            activeOpacity={0.65}
            className="h-9 w-9 items-center justify-center rounded-full"
          >
            <Text className="text-[17px] font-bold tracking-[2px] text-[#6B6B73]">
              •••
            </Text>
          </TouchableOpacity>

        </View>

        {/* ====================================================
            CATEGORY
        ==================================================== */}

        {categoryName && (
          <TouchableOpacity
            activeOpacity={0.75}
            className="mt-4 self-start rounded-full border border-[#3B3825] bg-[#211F16] px-3 py-[6px]"
          >
            <Text className="text-[10px] font-extrabold uppercase tracking-[0.7px] text-[#EAB308]">
              {categoryName}
            </Text>
          </TouchableOpacity>
        )}

        {/* ====================================================
            BODY
        ==================================================== */}

        <Text className="mt-4 text-[15px] leading-[24px] text-[#D4D4D8]">
          {item.body}
        </Text>

        {/* ====================================================
            IMAGE
        ==================================================== */}

        {imageUrl ? (
          <View className="mt-4 overflow-hidden rounded-[17px] border border-[#29292D] bg-[#0F0F11]">

            <Image
              source={{
                uri: imageUrl,
              }}
              className="h-[225px] w-full"
              resizeMode="cover"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

          </View>
        ) : null}

        {/* ====================================================
            REACTION SUMMARY
        ==================================================== */}

        {totalReactions > 0 && (
          <TouchableOpacity
            className="mt-4 flex-row items-center"
            onPress={() =>
              onPressReactionsCount?.(
                item
              )
            }
            activeOpacity={0.7}
          >

            {displayEmojis && (
              <View className="mr-2 flex-row items-center rounded-full border border-[#303034] bg-[#1B1B1F] px-2 py-1">

                <Text className="text-[12px]">
                  {displayEmojis}
                </Text>

              </View>
            )}

            <Text className="text-[11px] font-semibold text-[#85858D]">
              {totalReactions}{" "}
              {totalReactions === 1
                ? "reaction"
                : "reactions"}
            </Text>

          </TouchableOpacity>
        )}

        {/* ====================================================
            REACTION PICKER
        ==================================================== */}

        {showPicker && (
          <View className="absolute bottom-[67px] left-4 z-50">

            <ReactionPicker
              onSelectReaction={
                handlePickReaction
              }
            />

          </View>
        )}

        {/* ====================================================
            ACTION BAR
        ==================================================== */}

        <View className="mt-4 flex-row items-center border-t border-[#242428] pt-3">

          {/* ==================================================
              LIKE / REACTION
          ================================================== */}

          <TouchableOpacity
            onPress={
              handleToggleLike
            }
            onLongPress={() =>
              setShowPicker(
                !showPicker
              )
            }
            delayLongPress={250}
            activeOpacity={0.7}
            className={`mr-2 flex-row items-center rounded-full px-3 py-2 ${
              isLikedActive
                ? "bg-[#211F16]"
                : "bg-[#1A1A1D]"
            }`}
          >

            <Text className="text-[17px]">
              {isLikedActive
                ? activeReaction
                : "♡"}
            </Text>

            <Text
              className={`ml-1.5 text-[11px] ${
                isLikedActive
                  ? "font-extrabold text-[#EAB308]"
                  : "font-semibold text-[#85858D]"
              }`}
            >
              {totalReactions}
            </Text>

          </TouchableOpacity>

          {/* ==================================================
              COMMENT
          ================================================== */}

          <TouchableOpacity
            className="mr-2 flex-row items-center rounded-full bg-[#1A1A1D] px-3 py-2"
            onPress={() =>
              onPressComment?.(
                item
              )
            }
            activeOpacity={0.7}
          >

            <Text className="text-[15px]">
              💬
            </Text>

            <Text className="ml-1.5 text-[11px] font-semibold text-[#85858D]">
              Comment
            </Text>

          </TouchableOpacity>

          {/* ==================================================
              SHARE
          ================================================== */}

          <TouchableOpacity
            className="flex-row items-center rounded-full bg-[#1A1A1D] px-3 py-2"
            onPress={() =>
              onPressShare?.(
                item
              )
            }
            activeOpacity={0.7}
          >

            <Text className="text-[16px] text-[#85858D]">
              ↗
            </Text>

            <Text className="ml-1.5 text-[11px] font-semibold text-[#85858D]">
              Share
            </Text>

          </TouchableOpacity>

          {/* ==================================================
              SAVE
          ================================================== */}

          <TouchableOpacity
            className={`ml-auto h-[37px] w-[37px] items-center justify-center rounded-full ${
              item.isSaved
                ? "bg-[#211F16]"
                : "bg-[#1A1A1D]"
            }`}
            onPress={() =>
              onToggleSave(item)
            }
            activeOpacity={0.7}
          >

            <Text
              className={`text-[18px] ${
                item.isSaved
                  ? "text-[#EAB308]"
                  : "text-[#77777F]"
              }`}
            >
              {item.isSaved
                ? "★"
                : "☆"}
            </Text>

          </TouchableOpacity>

        </View>

      </View>
    </View>
  );
};

// ============================================================
// DATE FORMATTER
// ============================================================

function formatDate(
  dateString: string
) {
  if (!dateString) {
    return "";
  }

  const date = new Date(
    dateString
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}