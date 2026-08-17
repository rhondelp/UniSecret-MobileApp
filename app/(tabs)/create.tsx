import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { createConfession, searchUsers, UserMention } from "../../src/api/confessionApi";
import { useAuth } from "../../context/AuthContext";

export default function CreateConfessionScreen() {
  const [imageUrl, setImageUrl] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<UserMention[]>([]);
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleBodyChange = async (text: string) => {
    setBody(text);
    const match = text.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const q = match[1];
      setMentionQuery(q);
      if (q.length > 0) {
        try {
          const results = await searchUsers(q);
          setUserSuggestions(results);
        } catch (error) {
          console.error("User search error:", error);
          setUserSuggestions([]);
        }
      } else {
        setUserSuggestions([]);
      }
    } else {
      setUserSuggestions([]);
    }
  };

  const insertMention = (username: string) => {
    const updated = body.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
    setBody(updated);
    setUserSuggestions([]);
  };

  const submitConfession = async () => {
    if (!body.trim()) {
      Alert.alert("Empty Confession", "Please write something before posting.");
      return;
    }

    try {
      setLoading(true);

      await createConfession({
        body: body.trim(),
        isAnonymous: anonymous,
        universityId: user?.universityId || 0,
        categoryId: 1, // Default or selected category ID
      });

      Alert.alert(
        "Confession Submitted",
        "Your confession has been submitted for review.",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(tabs)");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Create confession error:", error);
      Alert.alert(
        "Unable to Submit",
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Confession</Text>
          <View style={{ width: 30 }} />
        </View>

        <Text style={styles.description}>
          Share something with your university community.
        </Text>

        <View>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind? Type @ to mention users..."
            placeholderTextColor="#999999"
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={handleBodyChange}
            maxLength={2000}
          />

          {/* MENTION AUTOCOMPLETE DROPDOWN */}
          {userSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={userSuggestions}
                keyExtractor={(item) => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionRow}
                    onPress={() => insertMention(item.username)}
                  >
                    <Text style={styles.suggestionName}>{item.name}</Text>
                    <Text style={styles.suggestionUsername}>@{item.username}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <Text style={styles.counter}>{body.length}/2000</Text>

        <TouchableOpacity
          style={styles.anonymousRow}
          onPress={() => setAnonymous(!anonymous)}
        >
          <View style={[styles.checkbox, anonymous && styles.checkboxActive]}>
            {anonymous && <Text style={styles.check}>✓</Text>}
          </View>

          <View style={styles.anonymousInfo}>
            <Text style={styles.anonymousTitle}>Post anonymously</Text>
            <Text style={styles.anonymousText}>
              Your identity will be hidden from other students.
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={submitConfession}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Submit Confession</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  back: { fontSize: 28, color: "#111111" },
  title: { fontSize: 20, fontWeight: "800", color: "#111111" },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#777777",
    marginBottom: 18,
  },
  input: {
    minHeight: 220,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#222222",
  },
  suggestionsContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E3E3",
    borderRadius: 12,
    maxHeight: 150,
    marginTop: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionName: { fontSize: 14, fontWeight: "600", color: "#111111" },
  suggestionUsername: { fontSize: 12, color: "#777777" },
  counter: { textAlign: "right", color: "#999999", fontSize: 11, marginTop: 6 },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E6E6E6",
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#BBBBBB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#111111", borderColor: "#111111" },
  check: { color: "#FFFFFF", fontWeight: "800" },
  anonymousInfo: { flex: 1, marginLeft: 12 },
  anonymousTitle: { fontSize: 14, fontWeight: "700", color: "#222222" },
  anonymousText: { fontSize: 11, color: "#888888", marginTop: 3 },
  submitButton: {
    height: 54,
    backgroundColor: "#111111",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});