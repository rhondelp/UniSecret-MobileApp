import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
  Animated,
  Easing,
} from "react-native";

import {
  getReactors,
  ReactionUser,
} from "../src/api/confessionApi";

type Props = {
  visible: boolean;
  reactableId: number;
  reactableType: "Confession" | "Comment";
  onClose: () => void;
};

const EMOJI_MAP: Record<string | number, string> = {
  0: "👍",
  1: "❤️",
  2: "😂",
  3: "😢",
  4: "😡",
  5: "😭",

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
  const [reactors, setReactors] = useState<ReactionUser[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  // =========================
  // ANIMATION
  // =========================

  const backdropOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const modalScale = useRef(
    new Animated.Value(0.92)
  ).current;

  const modalTranslateY = useRef(
    new Animated.Value(18)
  ).current;

  // =========================
  // LOAD REACTORS
  // =========================

  useEffect(() => {
    if (visible && reactableId > 0) {
      loadReactors();
    }
  }, [visible, reactableId]);

  // =========================
  // MODAL ANIMATION
  // =========================

  useEffect(() => {
    if (visible) {
      // Reset initial position
      backdropOpacity.setValue(0);
      modalScale.setValue(0.92);
      modalTranslateY.setValue(18);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.spring(modalScale, {
          toValue: 1,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),

        Animated.spring(modalTranslateY, {
          toValue: 0,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // =========================
  // LOAD
  // =========================

  const loadReactors = async () => {
    try {
      setLoading(true);

      const data = await getReactors(
        reactableId,
        reactableType
      );

      setReactors(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Failed to load reactors:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CLOSE ANIMATION
  // =========================

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(modalScale, {
        toValue: 0.96,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(modalTranslateY, {
        toValue: 10,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // =========================
  // RENDER
  // =========================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center px-5">
        {/* =========================
            BACKDROP
        ========================= */}

        <Animated.View
          className="absolute inset-0 bg-black"
          style={{
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.78],
            }),
          }}
        />

        {/* OUTSIDE TAP */}
        <Pressable
          className="absolute inset-0"
          onPress={handleClose}
        />

        {/* =========================
            FLOATING MODAL
        ========================= */}

        <Animated.View
          className="
            w-full
            max-w-[430px]
            overflow-hidden
            rounded-[28px]
            border
            border-[#2A2A2F]
            bg-[#111113]
          "
          style={{
            maxHeight: "72%",

            opacity: backdropOpacity,

            transform: [
              {
                scale: modalScale,
              },
              {
                translateY: modalTranslateY,
              },
            ],

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 14,
            },
            shadowOpacity: 0.5,
            shadowRadius: 28,
            elevation: 24,
          }}
        >
          {/* =========================
              HEADER
          ========================= */}

          <View className="border-b border-[#27272A] px-5 pb-4 pt-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                {/* REACTION ICON */}

                <View className="mr-3 h-11 w-11 items-center justify-center rounded-[14px] bg-[#211F12]">
                  <Text className="text-[21px]">
                    ❤️
                  </Text>
                </View>

                {/* TITLE */}

                <View>
                  <Text className="text-[17px] font-extrabold tracking-tight text-[#FAFAFA]">
                    Reactions
                  </Text>

                  {!loading && (
                    <Text className="mt-0.5 text-[11px] font-medium text-[#71717A]">
                      {reactors.length}{" "}
                      {reactors.length === 1
                        ? "person reacted"
                        : "people reacted"}
                    </Text>
                  )}
                </View>
              </View>

              {/* CLOSE */}

              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.7}
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
                className="h-9 w-9 items-center justify-center rounded-full bg-[#202024]"
              >
                <Text className="text-[15px] font-bold text-[#A1A1AA]">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* =========================
              CONTENT
          ========================= */}

          <View className="px-4 pb-4 pt-2">
            {loading ? (
              <View className="items-center justify-center py-14">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#1C1B14]">
                  <ActivityIndicator
                    size="small"
                    color="#EAB308"
                  />
                </View>

                <Text className="mt-4 text-[13px] font-medium text-[#71717A]">
                  Loading reactions...
                </Text>
              </View>
            ) : reactors.length === 0 ? (
              <View className="items-center justify-center px-6 py-14">
                <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-[#1C1B14]">
                  <Text className="text-[26px] text-[#EAB308]">
                    ♡
                  </Text>
                </View>

                <Text className="text-[15px] font-bold text-[#F4F4F5]">
                  No reactions yet
                </Text>

                <Text className="mt-1.5 text-center text-[12px] leading-[18px] text-[#71717A]">
                  Be the first to react to this
                  post.
                </Text>
              </View>
            ) : (
              <FlatList
                data={reactors}
                keyExtractor={(
                  item,
                  index
                ) =>
                  `${item.userId}-${item.type}-${index}`
                }
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                bounces
                contentContainerStyle={{
                  paddingTop: 8,
                  paddingBottom: 4,
                }}
                renderItem={({ item, index }) => {
                  const initial = (
                    item.name ||
                    item.username ||
                    "U"
                  )
                    .charAt(0)
                    .toUpperCase();

                  const emoji =
                    EMOJI_MAP[item.type] ||
                    "👍";

                  return (
                    <AnimatedReactionRow
                      item={item}
                      initial={initial}
                      emoji={emoji}
                      index={index}
                    />
                  );
                }}
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// =====================================================
// SMOOTH REACTION ROW
// =====================================================

type ReactionRowProps = {
  item: ReactionUser;
  initial: string;
  emoji: string;
  index: number;
};

const AnimatedReactionRow: React.FC<
  ReactionRowProps
> = ({
  item,
  initial,
  emoji,
  index,
}) => {
  const opacity = useRef(
    new Animated.Value(0)
  ).current;

  const translateY = useRef(
    new Animated.Value(8)
  ).current;

  useEffect(() => {
    const delay = Math.min(index * 25, 180);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [
          {
            translateY,
          },
        ],
      }}
    >
      <View className="mb-1.5 flex-row items-center rounded-[17px] bg-[#18181B] px-3.5 py-3">
        {/* AVATAR */}

        <View className="h-11 w-11 items-center justify-center rounded-[14px] border border-[#35353A] bg-[#27272A]">
          <Text className="text-[15px] font-extrabold text-[#EAB308]">
            {initial}
          </Text>
        </View>

        {/* USER */}

        <View className="ml-3 flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-bold text-[#F4F4F5]"
          >
            {item.name ||
              "Anonymous User"}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-0.5 text-[11px] font-medium text-[#71717A]"
          >
            @{item.username}
          </Text>
        </View>

        {/* REACTION */}

        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#232328]">
          <Text className="text-[19px]">
            {emoji}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};