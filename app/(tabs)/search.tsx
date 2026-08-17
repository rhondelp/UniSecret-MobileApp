import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [results, setResults] = useState<Confession[]>([]);
  
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
    } catch (e) {
      console.error("Error loading search metadata:", e);
    }
  };

  const executeSearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchConfessions({
        q: query.trim() || undefined,
        categoryId: selectedCategory ?? undefined,
        tag: selectedTag ?? undefined,
        universityId: user?.universityId ?? undefined,
      });

      if (Array.isArray(res)) {
        setResults(res);
      } else if (Array.isArray(res?.data)) {
        setResults(res.data);
      } else if (Array.isArray(res?.items)) {
        setResults(res.items);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, selectedTag, user?.universityId]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch();
    }, 400);

    return () => clearTimeout(handler);
  }, [executeSearch]);

  const handleToggleLike = async (item: Confession) => {
    const previousState = [...results];

    setResults((prev) =>
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
        setResults((prev) =>
          prev.map((c) =>
            c.id === item.id
              ? { ...c, isLiked: response.isLiked, likesCount: response.totalLikes }
              : c
          )
        );
      }
    } catch (err) {
      console.error(err);
      setResults(previousState);
      Alert.alert("Error", "Could not update like status.");
    }
  };

  const handleToggleSave = async (item: Confession) => {
    const previousState = [...results];

    setResults((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isSaved: !c.isSaved } : c))
    );

    try {
      const response = await toggleSave(item.id);
      if (typeof response?.isSaved === "boolean") {
        setResults((prev) =>
          prev.map((c) => (c.id === item.id ? { ...c, isSaved: response.isSaved } : c))
        );
      }
    } catch (err) {
      console.error(err);
      setResults(previousState);
      Alert.alert("Error", "Could not update save status.");
    }
  };

  return (
    <View style={styles.container}>
      {/* SEARCH HEADER */}
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search campus confessions or tags..."
          placeholderTextColor="#999999"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {/* TRENDING HASHTAGS */}
      {trendingHashtags.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Tags</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {trendingHashtags.map((h) => {
              const active = selectedTag === h.tag;
              return (
                <TouchableOpacity
                  key={h.id}
                  style={[styles.tagChip, active && styles.tagChipActive]}
                  onPress={() => setSelectedTag(active ? null : h.tag)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    #{h.tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <View style={styles.sectionContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === null && styles.categoryTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(active ? null : cat.id)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* SEARCH RESULTS FEED */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#111111" />
        </View>
      ) : (
        <FlatList
          data={results}
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
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptyText}>
                Try searching for different keywords or removing filters.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  header: { padding: 16, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  searchInput: {
    height: 48,
    backgroundColor: "#F1F1F1",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111111",
  },
  sectionContainer: { backgroundColor: "#FFFFFF", paddingVertical: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#666666", paddingHorizontal: 16, marginBottom: 6 },
  chipRow: { paddingHorizontal: 12 },
  tagChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  tagChipActive: { backgroundColor: "#111111" },
  tagText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  tagTextActive: { color: "#FFFFFF" },
  categoryChip: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  categoryChipActive: { backgroundColor: "#111111" },
  categoryText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  categoryTextActive: { color: "#FFFFFF" },
  listContent: { padding: 14, paddingBottom: 110 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#222222" },
  emptyText: { color: "#888888", textAlign: "center", marginTop: 6 },
});