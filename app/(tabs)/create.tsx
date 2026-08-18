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
  StatusBar,
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
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Confession</Text>
          <View style={{ width: 30 }} />
        </View>

        <Text style={styles.description}>
          Share something with your university community anonymously or under your handle.
        </Text>

        <View>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind? Type @ to mention users..."
            placeholderTextColor="#52525B"
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
                    activeOpacity={0.7}
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
          style={[styles.anonymousRow, anonymous && styles.anonymousRowActive]}
          onPress={() => setAnonymous(!anonymous)}
          activeOpacity={0.85}
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
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0A0A0C" />
          ) : (
            <Text style={styles.submitText}>Submit Confession</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0C" },
  content: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  back: { fontSize: 26, color: "#EAB308", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "800", color: "#F4F4F5", letterSpacing: -0.3 },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#A1A1AA",
    marginBottom: 20,
  },
  input: {
    minHeight: 220,
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#F4F4F5",
    lineHeight: 22,
  },
  suggestionsContainer: {
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 14,
    maxHeight: 160,
    marginTop: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  suggestionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionName: { fontSize: 14, fontWeight: "600", color: "#F4F4F5" },
  suggestionUsername: { fontSize: 12, color: "#EAB308" },
  counter: { textAlign: "right", color: "#71717A", fontSize: 12, marginTop: 8 },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161A",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  anonymousRowActive: {
    borderColor: "#EAB308",
    backgroundColor: "#1C1C22",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#52525B",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: "#EAB308", borderColor: "#EAB308" },
  check: { color: "#0A0A0C", fontWeight: "900", fontSize: 14 },
  anonymousInfo: { flex: 1, marginLeft: 14 },
  anonymousTitle: { fontSize: 14, fontWeight: "700", color: "#F4F4F5" },
  anonymousText: { fontSize: 12, color: "#A1A1AA", marginTop: 3 },
  submitButton: {
    height: 52,
    backgroundColor: "#EAB308",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: "#0A0A0C", fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
});
