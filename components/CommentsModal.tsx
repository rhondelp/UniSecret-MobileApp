import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getComments, createComment, CommentItem } from "../src/api/confessionApi";

type Props = {
  visible: boolean;
  confessionId: number;
  onClose: () => void;
  onCommentAdded?: () => void;
};

export const CommentsModal: React.FC<Props> = ({
  visible,
  confessionId,
  onClose,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (visible && confessionId > 0) {
      loadComments();
    }
  }, [visible, confessionId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await getComments(confessionId);
      setComments(res.items || []);
    } catch (e) {
      console.error("Failed to load comments:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;
    try {
      setSubmitting(true);
      const newComment = await createComment(confessionId, body.trim());
      setComments((prev) => [newComment, ...prev]);
      setBody("");
      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      console.error("Failed to submit comment:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#111111" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text style={styles.empty}>No comments yet. Be the first!</Text>}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <Text style={styles.author}>{item.authorName} <Text style={styles.username}>@{item.authorUsername}</Text></Text>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
              )}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              value={body}
              onChangeText={setBody}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!body.trim() || submitting) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!body.trim() || submitting}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.sendText}>Post</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "80%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 18, fontWeight: "800", color: "#111111" },
  closeText: { fontSize: 20, color: "#777777" },
  commentRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  author: { fontWeight: "700", fontSize: 13, color: "#111111" },
  username: { fontWeight: "400", color: "#777777", fontSize: 12 },
  body: { fontSize: 14, color: "#333333", marginTop: 3 },
  empty: { textAlign: "center", color: "#888888", marginVertical: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: "#E3E3E3", borderRadius: 22, paddingHorizontal: 16, backgroundColor: "#F9F9F9" },
  sendButton: { backgroundColor: "#111111", paddingHorizontal: 18, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  sendText: { color: "#FFFFFF", fontWeight: "700" },
});