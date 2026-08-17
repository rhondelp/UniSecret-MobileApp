import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Confession, ReactionType } from "../src/api/confessionApi";

type ConfessionCardProps = {
  item: Confession;
  onToggleLike: (item: Confession) => void;
  onToggleSave: (item: Confession) => void;
  onSelectReaction?: (item: Confession, type: ReactionType) => void;
  onPressReactionsCount?: (item: Confession) => void;
  onPressComment?: (item: Confession) => void;
  onPressShare?: (item: Confession) => void;
  onPressTag?: (tag: string) => void;
};

export const ConfessionCard: React.FC<ConfessionCardProps> = ({
  item,
  onToggleLike,
  onToggleSave,
  onPressReactionsCount,
  onPressComment,
  onPressShare,
}) => {
  return (
    <View style={styles.card}>
      {/* CARD HEADER */}
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.isAnonymous
              ? "?"
              : (item.user?.name || item.authorName || "A").charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.isAnonymous
              ? "Anonymous"
              : item.user?.name || item.authorName || "Anonymous User"}
          </Text>
          <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
        </View>

        <TouchableOpacity activeOpacity={0.6}>
          <Text style={styles.more}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY BADGE */}
      {item.category?.name && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category.name}</Text>
        </View>
      )}

      {/* BODY */}
      <Text style={styles.body}>{item.body}</Text>

      {/* IMAGE ATTACHMENT */}
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      {/* REACTION SUMMARY ROW */}
      {(item.likesCount || 0) > 0 && (
        <TouchableOpacity
          style={styles.reactionSummaryRow}
          onPress={() => onPressReactionsCount?.(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.reactionSummaryText}>
            👍 ❤️ {item.likesCount} {item.likesCount === 1 ? "reaction" : "reactions"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ACTIONS ROW */}
      <View style={styles.actions}>
        {/* REACTION / LIKE BUTTON */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onToggleLike(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionIcon,
              item.isLiked && styles.actionIconActive,
            ]}
          >
            {item.isLiked ? "♥" : "♡"}
          </Text>
          <Text
            style={[
              styles.actionText,
              item.isLiked && styles.actionTextActive,
            ]}
          >
            {item.likesCount || 0}
          </Text>
        </TouchableOpacity>

        {/* COMMENT BUTTON */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onPressComment?.(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        {/* SHARE BUTTON */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onPressShare?.(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        {/* SAVE / BOOKMARK BUTTON */}
        <TouchableOpacity
          style={styles.actionButtonRight}
          onPress={() => onToggleSave(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.actionIcon,
              item.isSaved && styles.actionIconActive,
            ]}
          >
            {item.isSaved ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    marginLeft: 11,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  time: {
    marginTop: 3,
    fontSize: 11,
    color: "#999999",
  },
  more: {
    fontSize: 17,
    color: "#777777",
    letterSpacing: 2,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F1F1",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 14,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555555",
  },
  body: {
    color: "#222222",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 13,
  },
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 12,
  },
  reactionSummaryRow: {
    marginTop: 12,
    paddingTop: 8,
  },
  reactionSummaryText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    marginTop: 12,
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
    color: "#333333",
    marginRight: 5,
  },
  actionIconActive: {
    color: "#EF4444",
  },
  actionText: {
    color: "#777777",
    fontSize: 12,
  },
  actionTextActive: {
    color: "#EF4444",
    fontWeight: "700",
  },
});