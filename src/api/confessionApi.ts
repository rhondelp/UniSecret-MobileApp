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

/**
 * Fetch confessions feed from the backend.
 */
export const fetchConfessions = async (): Promise<Confession[]> => {
  const data = await apiRequest("/Confessions");

  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data?.data)) {
    return data.data;
  } else if (Array.isArray(data?.items)) {
    return data.items;
  }
  return [];
};

/**
 * Toggle like status on a confession.
 */
export const toggleLikeConfession = async (
  confessionId: number
): Promise<ToggleLikeResponse> => {
  return apiRequest("/likes/toggle", {
    method: "POST",
    body: JSON.stringify({
      likeableId: confessionId,
      likeableType: "Confession",
    }),
  });
};

/**
 * Toggle saved status on a confession.
 */
export const toggleSaveConfession = async (
  confessionId: number
): Promise<{ isSaved?: boolean }> => {
  return apiRequest(`/savedposts/${confessionId}/toggle`, {
    method: "POST",
  });
};