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
} from "react-native";
import { router } from "expo-router";
import { createConfession } from "../../src/api/confessionApi";
import { useAuth } from "../../context/AuthContext";

export default function CreateConfessionScreen() {
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const submitConfession = async () => {
    if (!body.trim()) {
      Alert.alert("Empty Confession", "Please write something before posting.");
      return;
    }

    if (!user?.universityId) {
      Alert.alert(
        "Missing University Context",
        "Could not detect your university identity. Please re-login."
      );
      return;
    }

    try {
      setLoading(true);

      await createConfession({
        body: body.trim(),
        isAnonymous: anonymous,
        universityId: user.universityId,
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

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#999999"
          multiline
          textAlignVertical="top"
          value={body}
          onChangeText={setBody}
          maxLength={2000}
        />

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