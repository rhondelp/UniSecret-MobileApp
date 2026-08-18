import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { getReactors, ReactionUser } from "../src/api/confessionApi";

type Props = {
  visible: boolean;
  reactableId: number;
  reactableType: "Confession" | "Comment";
  onClose: () => void;
};

// Maps both enum index (0, 1, 2, 3, 4, 5) and string names to Emojis
const EMOJI_MAP: Record<string | number, string> = {
  // Numeric mapping (C# Enum serialized as integers)
  0: "👍",
  1: "❤️",
  2: "😂",
  3: "😢",
  4: "😡",
  5: "😭",

  // String fallback mapping
  Like: "👍",
  Love: "❤️",
  Haha: "😂",
  Sad: "😢",
  Angry: "😡",
  Cry: "😭",
};

export const ReactorsModal: React.FC<Props> = ({
  visible,
  reactableId,
  reactableType,
  onClose,
}) => {
  const [reactors, setReactors] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && reactableId > 0) {
      loadReactors();
    }
  }, [visible, reactableId]);

  const loadReactors = async () => {
    try {
      setLoading(true);
      const data = await getReactors(reactableId, reactableType);
      setReactors(data);
    } catch (e) {
      console.error("Failed to load reactors:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Reactions</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#EAB308" />
          ) : (
            <FlatList
              data={reactors}
              keyExtractor={(item, index) => `${item.userId}-${item.type}-${index}`}
              ListEmptyComponent={<Text style={styles.empty}>No reactions yet.</Text>}
              renderItem={({ item }) => (
                <View style={styles.reactorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {(item.name || item.username || "U").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.username}>@{item.username}</Text>
                  </View>
                  <Text style={styles.emoji}>{EMOJI_MAP[item.type] || "👍"}</Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#16161A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "60%",
    borderWidth: 1,
    borderColor: "#27272A",
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 18, fontWeight: "800", color: "#F4F4F5", letterSpacing: -0.3 },
  closeText: { fontSize: 20, color: "#A1A1AA", fontWeight: "600" },
  reactorRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#27272A" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#EAB308", fontWeight: "800", fontSize: 15 },
  name: { fontSize: 14, fontWeight: "700", color: "#F4F4F5" },
  username: { fontSize: 12, color: "#EAB308", marginTop: 2 },
  emoji: { fontSize: 22 },
  empty: { textAlign: "center", color: "#71717A", marginVertical: 30 },
});
