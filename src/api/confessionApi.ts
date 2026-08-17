import { apiRequest } from "./api";

export type Confession = {
  id: number;
  body: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;

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

  likesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
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

export const getConfessions = (params?: { page?: number; pageSize?: number }) => {
  const queryParams = params ? `?${new URLSearchParams(params as Record<string, string>)}` : "";
  return apiRequest(`/Confessions${queryParams}`);
};

export const searchConfessions = (query: SearchConfessionsQuery) => {
  const cleanParams: Record<string, string> = {};
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      cleanParams[key] = String(value);
    }
  });
  return apiRequest(`/Confessions/search?${new URLSearchParams(cleanParams)}`);
};

export const getConfession = (id: number) => apiRequest(`/Confessions/${id}`);

export const createConfession = (payload: CreateConfessionPayload) =>
  apiRequest("/Confessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const toggleLike = (likeableId: number, likeableType: "Confession" | "Comment"): Promise<ToggleLikeResponse> =>
  apiRequest("/Likes/toggle", {
    method: "POST",
    body: JSON.stringify({ likeableId, likeableType }),
  });

export const toggleSave = (confessionId: number): Promise<{ isSaved?: boolean }> =>
  apiRequest(`/SavedPosts/${confessionId}/toggle`, { method: "POST" });

export const getSavedPosts = () => apiRequest("/SavedPosts");