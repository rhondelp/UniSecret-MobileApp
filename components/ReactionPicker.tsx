import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ReactionType } from "../src/api/confessionApi";

type ReactionPickerProps = {
  onSelectReaction: (type: ReactionType) => void;
};

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "Like", emoji: "👍" },
  { type: "Love", emoji: "❤️" },
  { type: "Haha", emoji: "😂" },
  { type: "Sad", emoji: "😢" },
  { type: "Cry", emoji: "😭" },
  { type: "Angry", emoji: "😡" },
];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onSelectReaction }) => {
  return (
    <View style={styles.container}>
      {REACTIONS.map((item) => (
        <TouchableOpacity
          key={item.type}
          onPress={() => onSelectReaction(item.type)}
          style={styles.emojiButton}
          activeOpacity={0.7}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#16161A",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#27272A",
    alignSelf: "flex-start",
  },
  emojiButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  emoji: {
    fontSize: 24,
  },
});