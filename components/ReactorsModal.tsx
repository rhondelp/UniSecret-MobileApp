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

const EMOJI_MAP: Record<string, string> = {
  Like: "👍",
  Haha: "😂",
  Angry: "😡",
  Sad: "😢",
  Care: "❤️",
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
    if (visible) {
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
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginVertical: 30 }} color="#111111" />
          ) : (
            <FlatList
              data={reactors}
              keyExtractor={(item) => item.userId.toString() + item.type}
              ListEmptyComponent={<Text style={styles.empty}>No reactions yet.</Text>}
              renderItem={({ item }) => (
                <View style={styles.reactorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
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
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "60%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  title: { fontSize: 18, fontWeight: "800", color: "#111111" },
  closeText: { fontSize: 20, color: "#777777" },
  reactorRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#111111", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontWeight: "700" },
  name: { fontSize: 14, fontWeight: "700", color: "#111111" },
  username: { fontSize: 12, color: "#777777" },
  emoji: { fontSize: 22 },
  empty: { textAlign: "center", color: "#888888", marginVertical: 20 },
});