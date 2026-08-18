import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";

import { ReactionType } from "../src/api/confessionApi";

type ReactionPickerProps = {
  onSelectReaction: (type: ReactionType) => void;
};

const REACTIONS: {
  type: ReactionType;
  emoji: string;
}[] = [
  { type: "Like", emoji: "👍" },
  { type: "Love", emoji: "❤️" },
  { type: "Haha", emoji: "😂" },
  { type: "Sad", emoji: "😢" },
  { type: "Cry", emoji: "😭" },
  { type: "Angry", emoji: "😡" },
];

export const ReactionPicker: React.FC<
  ReactionPickerProps
> = ({ onSelectReaction }) => {
  // =====================================================
  // PICKER ENTRANCE ANIMATION
  // =====================================================

  const pickerScale = useRef(
    new Animated.Value(0.82)
  ).current;

  const pickerTranslateY = useRef(
    new Animated.Value(10)
  ).current;

  const pickerOpacity = useRef(
    new Animated.Value(0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pickerScale, {
        toValue: 1,
        damping: 15,
        stiffness: 260,
        mass: 0.7,
        useNativeDriver: true,
      }),

      Animated.spring(pickerTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 260,
        mass: 0.7,
        useNativeDriver: true,
      }),

      Animated.timing(pickerOpacity, {
        toValue: 1,
        duration: 130,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: pickerOpacity,
        transform: [
          {
            scale: pickerScale,
          },
          {
            translateY: pickerTranslateY,
          },
        ],
      }}
    >
      <View
        className="
          flex-row
          items-center
          self-start
          rounded-full
          border
          border-[#303036]
          bg-[#18181B]
          px-2
          py-2
        "
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 14,
        }}
      >
        {REACTIONS.map((item, index) => (
          <ReactionButton
            key={item.type}
            item={item}
            index={index}
            onSelectReaction={onSelectReaction}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// =====================================================
// REACTION BUTTON
// =====================================================

type ReactionButtonProps = {
  item: {
    type: ReactionType;
    emoji: string;
  };

  index: number;

  onSelectReaction: (
    type: ReactionType
  ) => void;
};

const ReactionButton: React.FC<
  ReactionButtonProps
> = ({
  item,
  index,
  onSelectReaction,
}) => {
  // =====================================================
  // TOUCH ANIMATION
  // =====================================================

  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const translateY = useRef(
    new Animated.Value(0)
  ).current;

  const backgroundOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const emojiScale = useRef(
    new Animated.Value(1)
  ).current;

  // =====================================================
  // PRESS IN
  // =====================================================

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.88,
        damping: 10,
        stiffness: 420,
        mass: 0.35,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: -2,
        damping: 10,
        stiffness: 380,
        mass: 0.35,
        useNativeDriver: true,
      }),

      Animated.spring(emojiScale, {
        toValue: 1.18,
        damping: 9,
        stiffness: 400,
        mass: 0.35,
        useNativeDriver: true,
      }),

      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =====================================================
  // PRESS OUT
  // =====================================================

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 9,
        stiffness: 350,
        mass: 0.4,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        damping: 9,
        stiffness: 350,
        mass: 0.4,
        useNativeDriver: true,
      }),

      Animated.spring(emojiScale, {
        toValue: 1,
        damping: 9,
        stiffness: 350,
        mass: 0.4,
        useNativeDriver: true,
      }),

      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // =====================================================
  // PRESS
  // =====================================================

  const handlePress = () => {
    onSelectReaction(item.type);
  };

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale,
          },
          {
            translateY,
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${item.type} reaction`}
        className="
          relative
          mx-[1px]
          h-[46px]
          w-[46px]
          items-center
          justify-center
          rounded-full
        "
      >
        {/* TOUCH HIGHLIGHT */}

        <Animated.View
          pointerEvents="none"
          className="
            absolute
            inset-0
            rounded-full
            bg-[#EAB308]
          "
          style={{
            opacity: backgroundOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.12],
            }),
          }}
        />

        {/* EMOJI */}

        <Animated.Text
          style={{
            transform: [
              {
                scale: emojiScale,
              },
            ],
          }}
          className="text-[25px]"
        >
          {item.emoji}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};