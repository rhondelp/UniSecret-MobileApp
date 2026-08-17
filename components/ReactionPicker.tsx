import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ReactionType } from "../src/api/confessionApi";

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "Like", emoji: "👍" },
  { type: "Love", emoji: "❤️" },
  { type: "Haha", emoji: "😂" },
  { type: "Sad", emoji: "😢" },
  { type: "Cry", emoji: "😭" },
  { type: "Angry", emoji: "😡" },
];

type Props = {
  onSelectReaction: (type: ReactionType) => void;
};

export const ReactionPicker: React.FC<Props> = ({ onSelectReaction }) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map((item) => (
        <TouchableOpacity key={item.type} onPress={() => onSelectReaction(item.type)} style={styles.emojiButton}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emojiButton: { paddingHorizontal: 6 },
  emoji: { fontSize: 24 },
});