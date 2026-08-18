import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import {
  Confession,
  ReactionType,
  getReactors,
  ReactionUser,
} from "../src/api/confessionApi";

import { ReactionPicker } from "./ReactionPicker";

type ConfessionCardProps = {
  item: Confession;
  onToggleLike: (item: Confession) => void;
  onSelectReaction?: (
    item: Confession,
    type: ReactionType
  ) => void;
  onToggleSave: (item: Confession) => void;
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

// Reaction type -> Emoji
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
  const [showPicker, setShowPicker] =
    useState(false);

  /**
   * Reactors belonging to THIS confession.
   */
  const [reactors, setReactors] = useState<
    ReactionUser[]
  >([]);

  const [loadingReactors, setLoadingReactors] =
    useState(false);

  /**
   * Prevent an old API request from overwriting
   * newer reaction data.
   */
  const [requestVersion, setRequestVersion] =
    useState(0);

  /**
   * Load the actual reactors for this confession.
   */
  const loadReactors = useCallback(
    async () => {
      const currentVersion =
        requestVersion + 1;

      setRequestVersion(
        currentVersion
      );

      try {
        setLoadingReactors(true);

        const response =
          await getReactors(
            item.id,
            "Confession"
          );

        /**
         * Only use this response if it is
         * still the newest request.
         */
        if (
          currentVersion ===
          requestVersion + 1
        ) {
          setReactors(
            Array.isArray(response)
              ? response
              : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load reactors:",
          error
        );
      } finally {
        setLoadingReactors(false);
      }
    },
    [
      item.id,
      requestVersion,
    ]
  );

  /**
   * Initial load.
   */
  useEffect(() => {
    loadReactors();
  }, [item.id]);

  /**
   * IMPORTANT:
   *
   * When the parent updates:
   *
   * likesCount
   * userReaction
   *
   * reload the reactors.
   *
   * This is what makes the emoji list
   * automatically update after a reaction.
   */
  useEffect(() => {
    if (item.id) {
      loadReactors();
    }
  }, [
    item.likesCount,
    item.userReaction,
  ]);

  /**
   * Get UNIQUE emojis actually used
   * by reactors on this confession.
   */
  const getDisplayEmojis =
    useCallback(() => {
      const uniqueTypes =
        new Set<string | number>();

      reactors.forEach(
        (reactor) => {
          if (
            reactor.type !==
              null &&
            reactor.type !==
              undefined
          ) {
            uniqueTypes.add(
              reactor.type
            );
          }
        }
      );

      return Array.from(uniqueTypes)
        .map(
          (type) =>
            EMOJI_MAP[type] || ""
        )
        .filter(Boolean)
        .join("");
    }, [reactors]);

  const displayEmojis =
    getDisplayEmojis();

  /**
   * TOTAL REACTIONS
   *
   * Never replace this with the number
   * of unique emojis.
   */
  const totalReactions =
    item.likesCount || 0;

  const isLikedActive =
    item.isLiked ||
    item.userReaction != null;

  /**
   * When selecting a reaction:
   *
   * 1. Close picker
   * 2. Tell parent to change reaction
   * 3. Refresh actual reactors
   */
  const handlePickReaction = async (
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

      /**
       * Give the backend mutation a chance
       * to complete before retrieving the
       * updated reactor list.
       */
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

  /**
   * Normal Like button.
   *
   * Refresh reactor emojis after the
   * reaction has been changed.
   */
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

  return (
    <View style={styles.card}>
      {/* CARD HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text
            style={
              styles.avatarText
            }
          >
            {item.isAnonymous
              ? "?"
              : (
                  item.user?.name ||
                  item.authorName ||
                  "A"
                )
                  .charAt(0)
                  .toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text
            style={
              styles.userName
            }
          >
            {item.isAnonymous
              ? "Anonymous Student"
              : item.user?.name ||
                item.authorName ||
                "Anonymous User"}
          </Text>

          <Text style={styles.time}>
            {formatDate(
              item.createdAt
            )}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
        >
          <Text style={styles.more}>
            •••
          </Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY */}
      {item.category?.name && (
        <View
          style={
            styles.categoryBadge
          }
        >
          <Text
            style={
              styles.categoryText
            }
          >
            {item.category.name}
          </Text>
        </View>
      )}

      {/* BODY */}
      <Text style={styles.body}>
        {item.body}
      </Text>

      {/* IMAGE */}
      {item.imageUrl ? (
        <Image
          source={{
            uri: item.imageUrl,
          }}
          style={
            styles.postImage
          }
          resizeMode="cover"
        />
      ) : null}

      {/* REACTION SUMMARY */}
      {totalReactions > 0 && (
        <TouchableOpacity
          style={
            styles.reactionSummaryRow
          }
          onPress={() =>
            onPressReactionsCount?.(
              item
            )
          }
          activeOpacity={0.7}
        >
          <Text
            style={
              styles.reactionSummaryText
            }
          >
            {displayEmojis && (
              <Text>
                {displayEmojis}{" "}
              </Text>
            )}

            {totalReactions}{" "}
            {totalReactions === 1
              ? "Reaction"
              : "Reactions"}
          </Text>
        </TouchableOpacity>
      )}

      {/* REACTION PICKER */}
      {showPicker && (
        <View
          style={
            styles.pickerWrapper
          }
        >
          <ReactionPicker
            onSelectReaction={
              handlePickReaction
            }
          />
        </View>
      )}

      {/* ACTIONS */}
      <View style={styles.actions}>
        {/* REACTION BUTTON */}
        <TouchableOpacity
          style={
            styles.actionButton
          }
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
        >
          <Text
            style={[
              styles.actionIcon,
              isLikedActive &&
                styles.actionIconActive,
            ]}
          >
            {isLikedActive
              ? item.userReaction
                ? EMOJI_MAP[
                    item.userReaction
                  ] || "♥"
                : "♥"
              : "♡"}
          </Text>

          {/* TOTAL COUNT */}
          <Text
            style={[
              styles.actionText,
              isLikedActive &&
                styles.actionTextActive,
            ]}
          >
            {totalReactions}
          </Text>
        </TouchableOpacity>

        {/* COMMENT */}
        <TouchableOpacity
          style={
            styles.actionButton
          }
          onPress={() =>
            onPressComment?.(item)
          }
          activeOpacity={0.7}
        >
          <Text
            style={styles.actionIcon}
          >
            💬
          </Text>

          <Text
            style={styles.actionText}
          >
            Comment
          </Text>
        </TouchableOpacity>

        {/* SHARE */}
        <TouchableOpacity
          style={
            styles.actionButton
          }
          onPress={() =>
            onPressShare?.(item)
          }
          activeOpacity={0.7}
        >
          <Text
            style={styles.actionIcon}
          >
            ↗
          </Text>

          <Text
            style={styles.actionText}
          >
            Share
          </Text>
        </TouchableOpacity>

        {/* SAVE */}
        <TouchableOpacity
          style={
            styles.actionButtonRight
          }
          onPress={() =>
            onToggleSave(item)
          }
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionIcon,
              item.isSaved &&
                styles.actionIconActive,
            ]}
          >
            {item.isSaved
              ? "★"
              : "☆"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatDate(
  dateString: string
) {
  if (!dateString) return "";

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

  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#16161A",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#27272A",
    position: "relative",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#EAB308",
    fontSize: 18,
    fontWeight: "800",
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F4F4F5",
  },

  time: {
    marginTop: 2,
    fontSize: 11,
    color: "#71717A",
  },

  more: {
    fontSize: 16,
    color: "#71717A",
    letterSpacing: 2,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#27272A",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#EAB308",
  },

  body: {
    color: "#D4D4D8",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 12,
  },

  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 14,
  },

  reactionSummaryRow: {
    marginTop: 12,
    paddingTop: 8,
  },

  reactionSummaryText: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "600",
  },

  pickerWrapper: {
    position: "absolute",
    bottom: 50,
    left: 16,
    zIndex: 10,
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#27272A",
    marginTop: 14,
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  actionButtonRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },

  actionIcon: {
    fontSize: 18,
    color: "#A1A1AA",
    marginRight: 6,
  },

  actionIconActive: {
    color: "#EAB308",
  },

  actionText: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
  },

  actionTextActive: {
    color: "#EAB308",
    fontWeight: "800",
  },
});