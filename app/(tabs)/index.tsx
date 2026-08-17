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
  getConfessions,
  toggleLike,
  toggleSave,
  Confession,
} from "../../src/api/confessionApi";
import { ConfessionCard } from "../../components/ConfessionCard";

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

  const refreshFeed = async () => {
    setRefreshing(true);
    await loadConfessions();
  };

  const handleToggleLike = async (item: Confession) => {
    const previousState = [...confessions];

    setConfessions((prev) =>
      prev.map((c) => {
        if (c.id === item.id) {
          const newIsLiked = !c.isLiked;
          const currentCount = c.likesCount || 0;
          return {
            ...c,
            isLiked: newIsLiked,
            likesCount: newIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1),
          };
        }
        return c;
      })
    );

    try {
      const response = await toggleLike(item.id, "Confession");
      if (typeof response?.totalLikes === "number") {
        setConfessions((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? { ...c, isLiked: response.isLiked, likesCount: response.totalLikes }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      setConfessions(previousState);
      Alert.alert("Error", "Could not update like status.");
    }
  };

  const handleToggleSave = async (item: Confession) => {
    const previousState = [...confessions];

    setConfessions((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isSaved: !c.isSaved } : c))
    );

    try {
      const response = await toggleSave(item.id);
      if (typeof response?.isSaved === "boolean") {
        setConfessions((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, isSaved: response.isSaved } : c))
        );
      }
    } catch (err) {
      console.error(err);
      setConfessions(previousState);
      Alert.alert("Error", "Could not update save status.");
    }
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

      <FlatList
        data={confessions}
        renderItem={({ item }) => (
          <ConfessionCard
            item={item}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshFeed} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No confessions yet</Text>
            <Text style={styles.emptyText}>
              Be the first person to share something with your community.
            </Text>
          </View>
        }
      />

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  loadingText: { marginTop: 12, color: "#777777", fontSize: 14 },
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
  brand: { fontSize: 24, fontWeight: "800", color: "#111111" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#888888" },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationIcon: { fontSize: 20, color: "#111111" },
  listContent: { padding: 14, paddingBottom: 110 },
  errorTitle: { fontSize: 20, fontWeight: "700", color: "#111111", marginTop: 15 },
  errorText: { textAlign: "center", color: "#777777", marginTop: 8 },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#111111",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryText: { color: "#FFFFFF", fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#222222", marginTop: 15 },
  emptyText: { color: "#888888", textAlign: "center", lineHeight: 20, marginTop: 7 },
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