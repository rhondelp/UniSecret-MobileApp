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
  StatusBar,
  Platform,
} from "react-native";
import { router } from "expo-router";
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
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reaction Modal State
  const [selectedConfessionId, setSelectedConfessionId] = useState<number | null>(null);
  const [reactorsModalVisible, setReactorsModalVisible] = useState(false);

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

  const handleSelectReaction = async (item: Confession, type: ReactionType) => {
    const previousState = [...confessions];

    try {
      const response = await setReaction(item.id, "Confession", type);
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
      Alert.alert("Error", "Could not update reaction.");
    }
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

  const handleOpenReactors = (item: Confession) => {
    setSelectedConfessionId(item.id);
    setReactorsModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
        <ActivityIndicator size="large" color="#EAB308" />
        <Text style={styles.loadingText}>Loading UniSecret...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
        <Text style={styles.errorTitle}>Unable to load feed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadConfessions} activeOpacity={0.85}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            Uni<Text style={styles.brandGold}>Secret</Text>
          </Text>
          <Text style={styles.subtitle}>Your campus. Your stories.</Text>
        </View>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push("/(tabs)/notifications")}
          activeOpacity={0.7}
        >
          <Text style={styles.notificationIcon}>♧</Text>
        </TouchableOpacity>
      </View>

      {/* FEED */}
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
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
            tintColor="#EAB308"
            colors={["#EAB308"]}
          />
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

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.85}
        onPress={() => router.push("/(tabs)/create")}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>

      <ReactorsModal
        visible={reactorsModalVisible}
        reactableId={selectedConfessionId || 0}
        reactableType="Confession"
        onClose={() => setReactorsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0C" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#0A0A0C" },
  loadingText: { marginTop: 14, color: "#A1A1AA", fontSize: 14, fontWeight: "500" },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 18 : 12,
    paddingBottom: 14,
    backgroundColor: "#16161A",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 24, fontWeight: "900", color: "#F4F4F5", letterSpacing: -0.5 },
  brandGold: { color: "#EAB308" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#A1A1AA" },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  notificationIcon: { fontSize: 20, color: "#EAB308" },
  listContent: { padding: 14, paddingBottom: 110 },
  errorTitle: { fontSize: 20, fontWeight: "700", color: "#F4F4F5", marginTop: 15 },
  errorText: { textAlign: "center", color: "#A1A1AA", marginTop: 8, lineHeight: 20 },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#EAB308",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: { color: "#0A0A0C", fontWeight: "800", fontSize: 14 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#F4F4F5", marginTop: 15 },
  emptyText: { color: "#A1A1AA", textAlign: "center", lineHeight: 20, marginTop: 8 },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#EAB308",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  floatingButtonText: {
    color: "#0A0A0C",
    fontSize: 32,
    fontWeight: "400",
    marginTop: -2,
  },
});