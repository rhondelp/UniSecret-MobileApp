import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
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
        className={`py-3 ${
          isReply
            ? "ml-5 border-l-2 border-[#EAB308] pl-3"
            : "border-b border-[#27272A]"
        }`}
      >
        <View className="flex-row items-center">
          <View className="h-[34px] w-[34px] items-center justify-center rounded-xl border border-[#3F3F46] bg-[#27272A]">
            <Text className="text-[13px] font-extrabold color-[#EAB308]">
              {item.isAnonymous ? "?" : item.authorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="ml-2.5">
            <Text className="text-[13px] font-bold text-[#F4F4F5]">
              {item.authorName}{" "}
              <Text className="text-xs font-normal color-[#EAB308]">
                @{item.authorUsername}
              </Text>
            </Text>
            <Text className="mt-0.5 text-[11px] text-[#71717A]">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Comment Body with styled mentions */}
        <Text className="mt-2 text-sm leading-5 text-[#D4D4D8]">
          {renderFormattedBody(item.body)}
        </Text>

        {/* Action Controls */}
        <View className="mt-2.5 flex-row gap-4">
          <TouchableOpacity
            className="py-0.5"
            onPress={() => handleSelectReaction(item.id, "Like")}
            onLongPress={() =>
              setActivePickerCommentId(
                activePickerCommentId === item.id ? null : item.id
              )
            }
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold text-[#A1A1AA]">
              👍 {item.likeCount > 0 ? item.likeCount : "Like"}
            </Text>
          </TouchableOpacity>

          {!isReply && (
            <TouchableOpacity
              className="py-0.5"
              onPress={() => setReplyingTo(item)}
              activeOpacity={0.7}
            >
              <Text className="text-xs font-semibold text-[#A1A1AA]">Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reaction Picker Popup */}
        {activePickerCommentId === item.id && (
          <View className="mt-2">
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
        className="flex-1 justify-end bg-black/75"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="max-h-[85%] rounded-t-[24px] border border-[#27272A] bg-[#16161A] p-5">
          <View className="mb-3.5 flex-row items-center justify-between">
            <Text className="text-lg font-extrabold tracking-tight text-[#F4F4F5]">
              Comments
            </Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text className="text-xl font-semibold text-[#A1A1AA]">✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator className="my-7" color="#EAB308" />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text className="my-7 text-center text-[#71717A]">
                  No comments yet. Be the first!
                </Text>
              }
              renderItem={({ item }) => renderCommentItem(item)}
            />
          )}

          {/* Replying Banner */}
          {replyingTo && (
            <View className="mb-2.5 flex-row justify-between rounded-lg border border-[#3F3F46] bg-[#27272A] p-2.5">
              <Text className="text-xs text-[#D4D4D8]">
                Replying to{" "}
                <Text className="font-bold color-[#EAB308]">
                  @{replyingTo.authorUsername}
                </Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)} activeOpacity={0.7}>
                <Text className="text-xs font-bold text-[#EF4444]">Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Mention Autocomplete Box */}
          {mentionSuggestions.length > 0 && (
            <View className="mb-2.5 max-h-[140px] rounded-xl border border-[#27272A] bg-[#16161A]">
              {mentionSuggestions.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  className="flex-row justify-between border-b border-[#27272A] p-3"
                  onPress={() => insertMention(u.username)}
                  activeOpacity={0.7}
                >
                  <Text className="text-[13px] font-semibold text-[#F4F4F5]">
                    {u.name}
                  </Text>
                  <Text className="text-xs color-[#EAB308]">@{u.username}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Input Box */}
          <View className="mt-3 flex-row items-center gap-2.5">
            <TextInput
              className="h-[46px] flex-1 rounded-full border border-[#27272A] bg-[#0A0A0C] px-4 text-sm text-[#F4F4F5]"
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
              className={`h-[46px] items-center justify-center rounded-full bg-[#EAB308] px-5 ${
                !body.trim() || submitting ? "opacity-50" : "opacity-100"
              }`}
              onPress={handleSubmit}
              disabled={!body.trim() || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#0A0A0C" size="small" />
              ) : (
                <Text className="text-sm font-extrabold text-[#0A0A0C]">
                  Post
                </Text>
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
        <Text key={i} className="font-bold color-[#EAB308]">
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