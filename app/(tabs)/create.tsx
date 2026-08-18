import React, {
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  StatusBar,
  Image,
} from "react-native";

import * as ImagePicker from "expo-image-picker";

import { router } from "expo-router";

import {
  createConfession,
  searchUsers,
  UserMention,
  uploadConfessionImage,
} from "../../src/api/confessionApi";

import { useAuth } from "../../context/AuthContext";

export default function CreateConfessionScreen() {
  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [mentionQuery, setMentionQuery] =
    useState("");

  const [userSuggestions, setUserSuggestions] =
    useState<UserMention[]>([]);

  const [body, setBody] =
    useState("");

  const [anonymous, setAnonymous] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const { user } = useAuth();

  /* ============================================================
   * IMAGE PICKER
   * ========================================================== */

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to choose an image."
        );

        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.85,
          exif: false,
        });

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const asset =
        result.assets[0];

      if (
        asset.fileSize &&
        asset.fileSize >
          10 * 1024 * 1024
      ) {
        Alert.alert(
          "Image Too Large",
          "Please choose an image smaller than 10 MB."
        );

        return;
      }

      setImageUri(asset.uri);
    } catch (error) {
      console.error(
        "Image picker error:",
        error
      );

      Alert.alert(
        "Unable to Select Image",
        "Something went wrong while selecting the image."
      );
    }
  };

  /* ============================================================
   * REMOVE IMAGE
   * ========================================================== */

  const removeImage = () => {
    if (loading) {
      return;
    }

    setImageUri(null);
  };

  /* ============================================================
   * BODY + MENTIONS
   * ========================================================== */

  const handleBodyChange = async (
    text: string
  ) => {
    setBody(text);

    const match =
      text.match(
        /@([a-zA-Z0-9_]*)$/
      );

    if (!match) {
      setMentionQuery("");
      setUserSuggestions([]);
      return;
    }

    const q = match[1];

    setMentionQuery(q);

    if (!q.length) {
      setUserSuggestions([]);
      return;
    }

    try {
      const results =
        await searchUsers(q);

      setUserSuggestions(
        Array.isArray(results)
          ? results
          : []
      );
    } catch (error) {
      console.error(
        "User search error:",
        error
      );

      setUserSuggestions([]);
    }
  };

  /* ============================================================
   * INSERT MENTION
   * ========================================================== */

  const insertMention = (
    username: string
  ) => {
    const updated =
      body.replace(
        /@([a-zA-Z0-9_]*)$/,
        `@${username} `
      );

    setBody(updated);
    setMentionQuery("");
    setUserSuggestions([]);
  };

  /* ============================================================
   * SUBMIT
   * ========================================================== */

  const submitConfession =
    async () => {
      console.log(
        "AUTH USER:",
        user
      );

      /**
       * We intentionally DO NOT check:
       *
       * user?.universityId
       *
       * The backend gets the university from the authenticated
       * user's database record.
       *
       * This prevents a stale AuthContext from incorrectly
       * blocking the post.
       */

      /* --------------------------------------------------------
       * BODY VALIDATION
       * ------------------------------------------------------ */

      const trimmedBody =
        body.trim();

      if (!trimmedBody) {
        Alert.alert(
          "Empty Confession",
          "Please write something before posting."
        );

        return;
      }

      if (
        trimmedBody.length >
        2000
      ) {
        Alert.alert(
          "Confession Too Long",
          "Your confession cannot exceed 2000 characters."
        );

        return;
      }

      /* --------------------------------------------------------
       * AUTH VALIDATION
       * ------------------------------------------------------ */

      if (!user) {
        Alert.alert(
          "Login Required",
          "Please log in before posting a confession."
        );

        return;
      }

      try {
        setLoading(true);

        let uploadedImageUrl:
          | string
          | null = null;

        /* ------------------------------------------------------
         * UPLOAD IMAGE
         * ---------------------------------------------------- */

        if (imageUri) {
          try {
            setUploadingImage(true);

            uploadedImageUrl =
              await uploadConfessionImage(
                imageUri
              );

            console.log(
              "Uploaded image URL:",
              uploadedImageUrl
            );
          } catch (error) {
            console.error(
              "Image upload error:",
              error
            );

            throw new Error(
              error instanceof Error
                ? error.message
                : "Unable to upload the image."
            );
          } finally {
            setUploadingImage(false);
          }
        }

        /* ------------------------------------------------------
         * CREATE CONFESSION
         *
         * Notice:
         *
         * NO universityId.
         *
         * The backend gets it from the authenticated user.
         * ---------------------------------------------------- */

        await createConfession({
          body:
            trimmedBody,

          isAnonymous:
            anonymous,

          /**
           * Replace this later with the actual selected category.
           */
          categoryId: 1,

          imageUrl:
            uploadedImageUrl,
        });

        /* ------------------------------------------------------
         * SUCCESS
         * ---------------------------------------------------- */

        Alert.alert(
          "Confession Submitted",
          "Your confession has been submitted for review.",
          [
            {
              text: "OK",

              onPress: () => {
                router.replace(
                  "/(tabs)"
                );
              },
            },
          ]
        );
      } catch (error) {
        console.error(
          "Create confession error:",
          error
        );

        setUploadingImage(false);

        Alert.alert(
          "Unable to Submit",
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your confession."
        );
      } finally {
        setLoading(false);
      }
    };

  /* ============================================================
   * UI
   * ========================================================== */

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#0A0A0C]"
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0A0A0C"
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 50,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View className="mb-5 flex-row items-center justify-between pt-2.5">
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            activeOpacity={0.7}
            disabled={loading}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Text className="text-2xl font-semibold text-[#EAB308]">
              ←
            </Text>
          </TouchableOpacity>

          <Text className="text-xl font-extrabold tracking-tight text-[#F4F4F5]">
            New Confession
          </Text>

          <View className="w-[30px]" />
        </View>

        <Text className="mb-5 text-sm leading-5 text-[#A1A1AA]">
          Share something with your university
          community anonymously or under your handle.
        </Text>

        {/* BODY */}

        <View>
          <TextInput
            className="min-h-[220px] rounded-2xl border border-[#27272A] bg-[#16161A] p-4 text-[15px] leading-6 text-[#F4F4F5]"
            placeholder="What's on your mind? Type @ to mention users..."
            placeholderTextColor="#52525B"
            multiline
            textAlignVertical="top"
            value={body}
            onChangeText={
              handleBodyChange
            }
            maxLength={2000}
            editable={!loading}
          />

          {/* MENTION AUTOCOMPLETE */}

          {userSuggestions.length >
            0 && (
            <View className="mt-1.5 max-h-[160px] rounded-xl border border-[#27272A] bg-[#16161A] shadow-lg shadow-black/30 elevation-8">
              <FlatList
                data={
                  userSuggestions
                }
                keyExtractor={(
                  item
                ) =>
                  item.id.toString()
                }
                keyboardShouldPersistTaps="handled"
                renderItem={({
                  item,
                }) => (
                  <TouchableOpacity
                    className="flex-row items-center justify-between border-b border-[#27272A] px-4 py-3"
                    onPress={() =>
                      insertMention(
                        item.username
                      )
                    }
                    activeOpacity={
                      0.7
                    }
                  >
                    <Text className="text-sm font-semibold text-[#F4F4F5]">
                      {item.name}
                    </Text>

                    <Text className="text-xs text-[#EAB308]">
                      @
                      {
                        item.username
                      }
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        {/* CHARACTER COUNT */}

        <Text className="mt-2 text-right text-xs text-[#71717A]">
          {body.length}/2000
        </Text>

        {/* IMAGE PREVIEW */}

        {imageUri && (
          <View className="mt-5 overflow-hidden rounded-2xl border border-[#27272A] bg-[#16161A]">
            <Image
              source={{
                uri: imageUri,
              }}
              className="h-[240px] w-full"
              resizeMode="cover"
            />

            <TouchableOpacity
              className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/70"
              onPress={
                removeImage
              }
              disabled={loading}
              activeOpacity={
                0.75
              }
            >
              <Text className="text-base font-bold text-white">
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ADD IMAGE */}

        {!imageUri && (
          <TouchableOpacity
            className="mt-5 flex-row items-center rounded-2xl border border-[#27272A] bg-[#16161A] p-4"
            onPress={pickImage}
            disabled={loading}
            activeOpacity={0.75}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#27272A]">
              <Text className="text-xl">
                📷
              </Text>
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-sm font-bold text-[#F4F4F5]">
                Add an image
              </Text>

              <Text className="mt-0.5 text-xs text-[#71717A]">
                JPG, PNG or WEBP • Max 10 MB
              </Text>
            </View>

            <Text className="text-xl text-[#A1A1AA]">
              ›
            </Text>
          </TouchableOpacity>
        )}

        {/* ANONYMOUS */}

        <TouchableOpacity
          className={`mt-5 flex-row items-center rounded-2xl border p-4 ${
            anonymous
              ? "border-[#EAB308] bg-[#1C1C22]"
              : "border-[#27272A] bg-[#16161A]"
          }`}
          onPress={() =>
            setAnonymous(
              !anonymous
            )
          }
          disabled={loading}
          activeOpacity={0.85}
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded-[7px] border-[1.5px] ${
              anonymous
                ? "border-[#EAB308] bg-[#EAB308]"
                : "border-[#52525B]"
            }`}
          >
            {anonymous && (
              <Text className="text-sm font-black text-[#0A0A0C]">
                ✓
              </Text>
            )}
          </View>

          <View className="ml-3.5 flex-1">
            <Text className="text-sm font-bold text-[#F4F4F5]">
              Post anonymously
            </Text>

            <Text className="mt-0.5 text-xs text-[#A1A1AA]">
              Your identity will be hidden from other students.
            </Text>
          </View>
        </TouchableOpacity>

        {/* SUBMIT */}

        <TouchableOpacity
          className={`mt-7 h-[52px] items-center justify-center rounded-[14px] bg-[#EAB308] shadow-md shadow-[#EAB308]/30 elevation-6 ${
            loading
              ? "opacity-50"
              : "opacity-100"
          }`}
          onPress={
            submitConfession
          }
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator
                color="#0A0A0C"
                size="small"
              />

              <Text className="ml-2 text-[15px] font-extrabold tracking-wide text-[#0A0A0C]">
                {uploadingImage
                  ? "Uploading image..."
                  : "Submitting..."}
              </Text>
            </View>
          ) : (
            <Text className="text-[15px] font-extrabold tracking-wide text-[#0A0A0C]">
              Submit Confession
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}