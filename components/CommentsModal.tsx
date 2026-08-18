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
  Alert,
} from "react-native";
import {
  getComments,
  createComment,
  setReaction,
  searchUsers,
  CommentItem,
  UserMention,
  ReactionType,
} from "../src/api/confessionApi";
import { ReactionPicker } from "./ReactionPicker";

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
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState<CommentItem | null>(null);

  // Reaction Picker State
  const [activePickerCommentId, setActivePickerCommentId] = useState<number | null>(null);

  // Mention Autocomplete State
  const [mentionSuggestions, setMentionSuggestions] = useState<UserMention[]>([]);

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

  const handleTextChange = async (text: string) => {
    setBody(text);

    // Check for @mention trigger
    const match = text.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const q = match[1];
      if (q.length > 0) {
        try {
          const results = await searchUsers(q);
          setMentionSuggestions(results);
        } catch {
          setMentionSuggestions([]);
        }
      } else {
        setMentionSuggestions([]);
      }
    } else {
      setMentionSuggestions([]);
    }
  };

  const insertMention = (username: string) => {
    const updated = body.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
    setBody(updated);
    setMentionSuggestions([]);
  };

  const handleSubmit = async () => {
    if (!body.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await createComment(
        confessionId,
        body.trim(),
        isAnonymous,
        replyingTo?.id
      );

      if (replyingTo) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          )
        );
      } else {
        setComments((prev) => [newComment, ...prev]);
      }

      setBody("");
      setReplyingTo(null);
      setMentionSuggestions([]);
      if (onCommentAdded) onCommentAdded();
    } catch (e) {
      console.error("Failed to submit comment:", e);
      Alert.alert("Error", "Unable to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectReaction = async (commentId: number, type: ReactionType) => {
    setActivePickerCommentId(null);
    try {
      const response = await setReaction(commentId, "Comment", type);

      setComments((prev) =>
        updateCommentReactionInList(prev, commentId, response.totalReactions)
      );
    } catch (e) {
      console.error("Failed to set comment reaction:", e);
    }
  };

  const updateCommentReactionInList = (
    list: CommentItem[],
    id: number,
    count: number
  ): CommentItem[] => {
    return list.map((item) => {
      if (item.id === id) {
        return { ...item, likeCount: count };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: updateCommentReactionInList(item.replies, id, count),
        };
      }
      return item;
    });
  };

  const renderCommentItem = (item: CommentItem, isReply = false) => {
    return (
      <View
        key={item.id}
        style={[styles.commentRow, isReply && styles.replyRow]}
      >
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.isAnonymous ? "?" : item.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.author}>
              {item.authorName}{" "}
              <Text style={styles.username}>@{item.authorUsername}</Text>
            </Text>
            <Text style={styles.time}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>

        {/* Comment Body with styled mentions */}
        <Text style={styles.body}>{renderFormattedBody(item.body)}</Text>

        {/* Action Controls */}
        <View style={styles.commentActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleSelectReaction(item.id, "Like")}
            onLongPress={() =>
              setActivePickerCommentId(
                activePickerCommentId === item.id ? null : item.id
              )
            }
            activeOpacity={0.7}
          >
            <Text style={styles.actionText}>
              👍 {item.likeCount > 0 ? item.likeCount : "Like"}
            </Text>
          </TouchableOpacity>

          {!isReply && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setReplyingTo(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reaction Picker Popup */}
        {activePickerCommentId === item.id && (
          <View style={styles.pickerContainer}>
            <ReactionPicker
              onSelectReaction={(type) =>
                handleSelectReaction(item.id, type)
              }
            />
          </View>
        )}

        {/* Nested Replies */}
        {item.replies &&
          item.replies.map((reply) => renderCommentItem(reply, true))}
      </View>
    );
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
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#EAB308" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.empty}>No comments yet. Be the first!</Text>
              }
              renderItem={({ item }) => renderCommentItem(item)}
            />
          )}

          {/* Replying Banner */}
          {replyingTo && (
            <View style={styles.replyingBanner}>
              <Text style={styles.replyingText}>
                Replying to <Text style={{ fontWeight: "700", color: "#EAB308" }}>@{replyingTo.authorUsername}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)} activeOpacity={0.7}>
                <Text style={styles.cancelReplyText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mention Autocomplete Box */}
          {mentionSuggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {mentionSuggestions.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.suggestionRow}
                  onPress={() => insertMention(u.username)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionName}>{u.name}</Text>
                  <Text style={styles.suggestionUsername}>@{u.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Box */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.authorUsername}...`
                  : "Write a comment... (use @ to mention)"
              }
              placeholderTextColor="#52525B"
              value={body}
              onChangeText={handleTextChange}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!body.trim() || submitting) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!body.trim() || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#0A0A0C" size="small" />
              ) : (
                <Text style={styles.sendText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

function renderFormattedBody(body: string) {
  const parts = body.split(/(?=@\w+)|(?<=\w+\b)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <Text key={i} style={styles.mentionText}>
          {part}
        </Text>
      );
    }
    return part;
  });
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#16161A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 18, fontWeight: "800", color: "#F4F4F5", letterSpacing: -0.3 },
  closeText: { fontSize: 20, color: "#A1A1AA", fontWeight: "600" },
  commentRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#27272A" },
  replyRow: { marginLeft: 20, borderLeftWidth: 2, borderLeftColor: "#EAB308", paddingLeft: 12, borderBottomWidth: 0 },
  commentHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#EAB308", fontWeight: "800", fontSize: 13 },
  authorInfo: { marginLeft: 10 },
  author: { fontWeight: "700", fontSize: 13, color: "#F4F4F5" },
  username: { fontWeight: "400", color: "#EAB308", fontSize: 12 },
  time: { fontSize: 11, color: "#71717A", marginTop: 1 },
  body: { fontSize: 14, color: "#D4D4D8", marginTop: 8, lineHeight: 20 },
  mentionText: { color: "#EAB308", fontWeight: "700" },
  commentActions: { flexDirection: "row", gap: 16, marginTop: 10 },
  actionBtn: { paddingVertical: 2 },
  actionText: { fontSize: 12, color: "#A1A1AA", fontWeight: "600" },
  pickerContainer: { marginTop: 8 },
  replyingBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#27272A",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  replyingText: { fontSize: 12, color: "#D4D4D8" },
  cancelReplyText: { fontSize: 12, color: "#EF4444", fontWeight: "700" },
  suggestionsBox: {
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 12,
    maxHeight: 140,
    marginBottom: 10,
  },
  suggestionRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestionName: { fontSize: 13, fontWeight: "600", color: "#F4F4F5" },
  suggestionUsername: { fontSize: 12, color: "#EAB308" },
  empty: { textAlign: "center", color: "#71717A", marginVertical: 30 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 10 },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 23,
    paddingHorizontal: 16,
    backgroundColor: "#0A0A0C",
    color: "#F4F4F5",
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#EAB308",
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "#0A0A0C", fontWeight: "800", fontSize: 14 },
});