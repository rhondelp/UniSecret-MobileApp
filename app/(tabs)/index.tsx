import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import { apiRequest } from "../../src/api/api";

type Confession = {
  id: number;
  body: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;

  category?: {
    id: number;
    name: string;
  };

  user?: {
    id: number;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };

  likesCount?: number;
  isLiked?: boolean;
};

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

      const data = await apiRequest("/Confessions");

      console.log("Confessions API Response:", data);

      /*
       * Supports these possible API response formats:
       *
       * 1. [ ... ]
       * 2. { data: [ ... ] }
       * 3. { items: [ ... ] }
       */

      if (Array.isArray(data)) {
        setConfessions(data);
      } else if (Array.isArray(data?.data)) {
        setConfessions(data.data);
      } else if (Array.isArray(data?.items)) {
        setConfessions(data.items);
      } else {
        setConfessions([]);
      }
    } catch (error) {
      console.error("Confessions API Error:", error);

      if (error instanceof Error) {
        setError(error.message);
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

  const renderConfession = ({
    item,
  }: {
    item: Confession;
  }) => {
    return (
      <View style={styles.card}>

        {/* ================================ */}
        {/* USER HEADER */}
        {/* ================================ */}

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

            <Text style={styles.time}>
              {formatDate(item.createdAt)}
            </Text>

          </View>

          <TouchableOpacity>
            <Text style={styles.more}>
              •••
            </Text>
          </TouchableOpacity>

        </View>

        {/* ================================ */}
        {/* CATEGORY */}
        {/* ================================ */}

        {item.category?.name && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {item.category.name}
            </Text>
          </View>
        )}

        {/* ================================ */}
        {/* CONFESSION BODY */}
        {/* ================================ */}

        <Text style={styles.body}>
          {item.body}
        </Text>

        {/* ================================ */}
        {/* ACTIONS */}
        {/* ================================ */}

        <View style={styles.actions}>

          {/* LIKE */}

          <TouchableOpacity
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>
              {item.isLiked ? "♥" : "♡"}
            </Text>

            <Text style={styles.actionText}>
              {item.likesCount || 0}
            </Text>
          </TouchableOpacity>

          {/* SAVE */}

          <TouchableOpacity
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>
              ♧
            </Text>

            <Text style={styles.actionText}>
              Save
            </Text>
          </TouchableOpacity>

        </View>

      </View>
    );
  };

  // ========================================
  // LOADING SCREEN
  // ========================================

  if (loading) {
    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#111111"
        />

        <Text style={styles.loadingText}>
          Loading UniSecret...
        </Text>

      </View>
    );
  }

  // ========================================
  // ERROR SCREEN
  // ========================================

  if (error) {
    return (
      <View style={styles.center}>

        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>
            !
          </Text>
        </View>

        <Text style={styles.errorTitle}>
          Unable to load feed
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadConfessions}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // ========================================
  // MAIN HOME FEED
  // ========================================

  return (
    <View style={styles.container}>

      {/* ================================== */}
      {/* HEADER */}
      {/* ================================== */}

      <View style={styles.header}>

        <View>

          <Text style={styles.brand}>
            UniSecret
          </Text>

          <Text style={styles.subtitle}>
            Your campus. Your stories.
          </Text>

        </View>

        {/* NOTIFICATIONS */}

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() =>
            router.push("/(tabs)/notifications")
          }
        >
          <Text style={styles.notificationIcon}>
            ♧
          </Text>
        </TouchableOpacity>

      </View>

      {/* ================================== */}
      {/* CONFESSION FEED */}
      {/* ================================== */}

      <FlatList
        data={confessions}
        renderItem={renderConfession}
        keyExtractor={(item) =>
          item.id.toString()
        }
        contentContainerStyle={
          styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>

            <Text style={styles.emptyIcon}>
              ✦
            </Text>

            <Text style={styles.emptyTitle}>
              No confessions yet
            </Text>

            <Text style={styles.emptyText}>
              Be the first person to share
              something with your community.
            </Text>

          </View>
        }
      />

      {/* ================================== */}
      {/* CREATE CONFESSION BUTTON */}
      {/* ================================== */}

      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.85}
        onPress={() =>
          router.push("/(tabs)/create")
        }
      >
        <Text style={styles.floatingButtonText}>
          +
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// ========================================
// DATE FORMATTER
// ========================================

function formatDate(dateString: string) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  // --------------------------------------
  // GENERAL
  // --------------------------------------

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

  // --------------------------------------
  // HEADER
  // --------------------------------------

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

  // --------------------------------------
  // LIST
  // --------------------------------------

  listContent: {
    padding: 14,
    paddingBottom: 110,
  },

  // --------------------------------------
  // CONFESSION CARD
  // --------------------------------------

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

  // --------------------------------------
  // CATEGORY
  // --------------------------------------

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

  // --------------------------------------
  // CONFESSION BODY
  // --------------------------------------

  body: {
    color: "#222222",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 13,
  },

  // --------------------------------------
  // ACTIONS
  // --------------------------------------

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

  actionText: {
    color: "#777777",
    fontSize: 12,
  },

  // --------------------------------------
  // ERROR
  // --------------------------------------

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

  // --------------------------------------
  // EMPTY STATE
  // --------------------------------------

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

  // --------------------------------------
  // FLOATING CREATE BUTTON
  // --------------------------------------

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