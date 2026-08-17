import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  fetchConfessions,
  toggleLikeConfession,
  toggleSaveConfession,
  Confession,
} from "../../src/api/confessionApi";

export default function HomeScreen() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfessions();
  }, []);

  const loadConfessions = async () => {
    try {
      setError(null);
      const data = await fetchConfessions();
      setConfessions(data);
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

  const refreshFeed = async () => {
    setRefreshing(true);
    await loadConfessions();
  };

  // ========================================
  // OPTIMISTIC LIKE TOGGLE
  // ========================================
  const handleToggleLike = async (item: Confession) => {
    const previousState = [...confessions];

    // 1. Optimistic UI update
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

    // 2. Perform Network Request
    try {
      const response = await toggleLikeConfession(item.id);

      // 3. Sync with exact response count if provided
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
      console.error("Failed to toggle like:", err);
      // 4. Rollback state on error
      setConfessions(previousState);
      Alert.alert("Error", "Could not update like status. Please try again.");
    }
  };

  // ========================================
  // OPTIMISTIC SAVE TOGGLE
  // ========================================
  const handleToggleSave = async (item: Confession) => {
    const previousState = [...confessions];

    // 1. Optimistic UI update
    setConfessions((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, isSaved: !c.isSaved } : c
      )
    );

    // 2. Perform Network Request
    try {
      const response = await toggleSaveConfession(item.id);

      // 3. Sync state if explicitly returned from backend
      if (typeof response?.isSaved === "boolean") {
        setConfessions((prev) =>
          prev.map((c) =>
            c.id === item.id ? { ...c, isSaved: response.isSaved } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle save:", err);
      // 4. Rollback state on error
      setConfessions(previousState);
      Alert.alert("Error", "Could not save post. Please try again.");
    }
  };

  const renderConfession = ({ item }: { item: Confession }) => {
    return (
      <View style={styles.card}>
        {/* USER HEADER */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.isAnonymous
                ? "?"
                : item.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.isAnonymous
                ? "Anonymous"
                : item.user?.name || "User"}
            </Text>

            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.more}>•••</Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY */}
        {item.category?.name && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category.name}</Text>
          </View>
        )}

        {/* CONFESSION BODY */}
        <Text style={styles.body}>{item.body}</Text>

        {/* ACTIONS */}
        <View style={styles.actions}>
          {/* LIKE BUTTON */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleLike(item)}
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

          {/* SAVE BUTTON */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleToggleSave(item)}
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

            <Text
              style={[
                styles.actionText,
                item.isSaved && styles.actionTextActive,
              ]}
            >
              {item.isSaved ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#111111" />
        <Text style={styles.loadingText}>Loading UniSecret...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorTitle}>Unable to load feed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConfessions}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>UniSecret</Text>
          <Text style={styles.subtitle}>Your campus. Your stories.</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/(tabs)/notifications")}
        >
          <Text style={styles.notificationIcon}>♧</Text>
        </TouchableOpacity>
      </View>

      {/* CONFESSION FEED */}
      <FlatList
        data={confessions}
        renderItem={renderConfession}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✦</Text>
            <Text style={styles.emptyTitle}>No confessions yet</Text>
            <Text style={styles.emptyText}>
              Be the first person to share something with your community.
            </Text>
          </View>
        }
      />

      {/* CREATE CONFESSION BUTTON */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/create")}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F7F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#777777",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#888888",
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: {
    fontSize: 20,
    color: "#111111",
  },
  listContent: {
    padding: 14,
    paddingBottom: 110,
  },
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
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    marginTop: 16,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 22,
  },
  actionIcon: {
    fontSize: 21,
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
  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  errorIconText: {
    fontSize: 25,
    fontWeight: "700",
    color: "#C62828",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginTop: 15,
  },
  errorText: {
    textAlign: "center",
    color: "#777777",
    marginTop: 8,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#111111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 40,
    color: "#999999",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginTop: 15,
  },
  emptyText: {
    color: "#888888",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 7,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "300",
    marginTop: -2,
  },
});