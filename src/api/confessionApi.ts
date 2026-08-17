import { apiRequest } from "./api";

export type ReactionType =
  | "Like"
  | "Love"
  | "Haha"
  | "Sad"
  | "Angry"
  | "Cry";

// Map string reaction types to C# Enum integer values
const REACTION_TYPE_MAP: Record<ReactionType, number> = {
  Like: 0,
  Love: 1,
  Haha: 2,
  Sad: 3,
  Angry: 4,
  Cry: 5,
};

export type ReactionUser = {
  userId: number;
  name: string;
  username: string;
  type: ReactionType;
  reactedAt: string;
};

export type Confession = {
  id: number;
  universityId?: number;
  categoryId?: number;
  body: string;
  isAnonymous: boolean;
  authorName?: string;
  authorUsername?: string;
  status: string;
  createdAt: string;
  imageUrl?: string | null;

  category?: {
    id: number;
    name: string;
  };

  user?: {
    id: number;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };

  // Total number of reactions on this confession
  likesCount?: number;

  isLiked?: boolean;
  isSaved?: boolean;

  // Current user's reaction
  userReaction?: ReactionType | null;
};

export type ToggleLikeResponse = {
  isLiked: boolean;
  totalLikes: number;
};

export type CreateConfessionPayload = {
  universityId: number;
  categoryId?: number;
  body: string;
  isAnonymous?: boolean;
};

export type SearchConfessionsQuery = {
  q?: string;
  universityId?: number;
  categoryId?: number;
  tag?: string;
  page?: number;
  pageSize?: number;
};

export type Category = {
  id: number;
  name: string;
};

export type Hashtag = {
  id: number;
  tag: string;
  usageCount?: number;
};

export type CommentItem = {
  id: number;
  confessionId: number;
  parentId?: number | null;
  body: string;
  isAnonymous: boolean;
  authorName: string;
  authorUsername: string;
  likeCount: number;
  createdAt: string;
  replies?: CommentItem[];
};

export type UserMention = {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

export const searchUsers = (
  q: string
): Promise<UserMention[]> =>
  apiRequest(
    `/Users/search?q=${encodeURIComponent(q)}`
  );

export const getConfessions = (
  params?: {
    page?: number;
    pageSize?: number;
  }
) => {
  const queryParams = params
    ? `?${new URLSearchParams(
        params as Record<string, string>
      )}`
    : "";

  return apiRequest(
    `/Confessions${queryParams}`
  );
};

export const searchConfessions = (
  query: SearchConfessionsQuery
) => {
  const cleanParams: Record<string, string> = {};

  Object.entries(query).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        cleanParams[key] = String(value);
      }
    }
  );

  return apiRequest(
    `/Confessions/search?${new URLSearchParams(
      cleanParams
    )}`
  );
};

export const getConfession = (id: number) =>
  apiRequest(`/Confessions/${id}`);

export const createConfession = (
  payload: CreateConfessionPayload
) =>
  apiRequest("/Confessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const setReaction = async (
  reactableId: number,
  reactableType:
    | "Confession"
    | "Comment",
  type: ReactionType
) => {
  return apiRequest("/Reactions/set", {
    method: "POST",
    body: JSON.stringify({
      reactableId,
      reactableType,

      // Convert:
      // Like -> 0
      // Love -> 1
      // Haha -> 2
      // Sad -> 3
      // Angry -> 4
      // Cry -> 5
      type: REACTION_TYPE_MAP[type] ?? 0,
    }),
  });
};

export const toggleLike = async (
  likeableId: number,
  likeableType:
    | "Confession"
    | "Comment"
): Promise<ToggleLikeResponse> => {
  const response = await setReaction(
    likeableId,
    likeableType,
    "Like"
  );

  return {
    isLiked:
      response.userReaction !== null &&
      response.userReaction !== undefined,

    totalLikes:
      response.totalReactions,
  };
};

export const toggleSave = (
  confessionId: number
): Promise<{ isSaved?: boolean }> =>
  apiRequest(
    `/SavedPosts/${confessionId}/toggle`,
    {
      method: "POST",
    }
  );

export const getSavedPosts = () =>
  apiRequest("/SavedPosts");

export const getCategories =
  (): Promise<Category[]> =>
    apiRequest("/Categories");

export const getTrendingHashtags =
  (): Promise<Hashtag[]> =>
    apiRequest("/Hashtags/trending");

/**
 * Get every reactor for a specific confession.
 *
 * Example response:
 *
 * [
 *   {
 *     userId: 1,
 *     name: "John",
 *     username: "john",
 *     type: "Love",
 *     reactedAt: "..."
 *   },
 *   {
 *     userId: 2,
 *     name: "Jane",
 *     username: "jane",
 *     type: "Sad",
 *     reactedAt: "..."
 *   }
 * ]
 */
export const getReactors = (
  reactableId: number,
  reactableType:
    | "Confession"
    | "Comment"
): Promise<ReactionUser[]> =>
  apiRequest(
    `/Reactions/users?reactableId=${reactableId}&reactableType=${reactableType}`
  );

export const shareConfession = (
  confessionId: number,
  caption?: string
) =>
  apiRequest("/Shares", {
    method: "POST",
    body: JSON.stringify({
      confessionId,
      caption,
    }),
  });

export const getComments = (
  confessionId: number,
  page = 1,
  pageSize = 20
): Promise<{ items: CommentItem[] }> =>
  apiRequest(
    `/confessions/${confessionId}/comments?page=${page}&pageSize=${pageSize}`
  );

export const createComment = (
  confessionId: number,
  body: string,
  isAnonymous = false,
  parentId?: number
) =>
  apiRequest(
    `/confessions/${confessionId}/comments`,
    {
      method: "POST",
      body: JSON.stringify({
        body,
        isAnonymous,
        parentId,
      }),
    }
  );