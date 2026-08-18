import { apiRequest, uploadApiRequest } from "./api";

/* ============================================================
 * REACTIONS
 * ========================================================== */

export type ReactionType =
  | "Like"
  | "Love"
  | "Haha"
  | "Sad"
  | "Angry"
  | "Cry";

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
  type: ReactionType | number;
  reactedAt: string;
};

/* ============================================================
 * CONFESSION
 * ========================================================== */

export type Confession = {
  id: number;

  universityId?: number;

  categoryId?: number;

  /*
   * Backend returns categoryName directly.
   */
  categoryName?: string | null;

  /*
   * Some endpoints may return a nested category.
   */
  category?: {
    id: number;
    name: string;
  } | null;

  body: string;

  isAnonymous: boolean;

  authorName?: string;

  authorUsername?: string;

  status: string | number;

  scheduledAt?: string | null;

  createdAt: string;

  updatedAt?: string;

  imageUrl?: string | null;

  user?: {
    id: number;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };

  likesCount?: number;

  isLiked?: boolean;

  isSaved?: boolean;

  userReaction?: ReactionType | number | null;

  commentCount?: number;

  shareCount?: number;
};

/* ============================================================
 * CREATE CONFESSION
 * ========================================================== */

export type CreateConfessionPayload = {
  categoryId: number;

  body: string;

  isAnonymous?: boolean;

  scheduledAt?: string | null;

  imageUrl?: string | null;
};

/* ============================================================
 * IMAGE UPLOAD
 * ========================================================== */

export type UploadImageResponse = {
  imageUrl: string;
};

/**
 * Normalize an image URL returned by the backend.
 *
 * Your backend currently returns:
 *
 * http://192.168.8.112:5277/v1/uploads/file.jpeg
 *
 * But the actual API is mounted under:
 *
 * http://192.168.8.112:5277/api/v1
 *
 * Therefore we convert:
 *
 * /v1/uploads/...
 *
 * into:
 *
 * /api/v1/uploads/...
 */
export const normalizeImageUrl = (
  imageUrl?: string | null
): string | null => {
  if (!imageUrl) {
    return null;
  }

  let url = imageUrl.trim();

  if (!url) {
    return null;
  }

  /*
   * If the backend accidentally returns:
   *
   * /v1/uploads/...
   *
   * add /api before /v1.
   */
  if (url.includes("/v1/uploads/")) {
    url = url.replace(
      "/v1/uploads/",
      "/api/v1/uploads/"
    );
  }

  /*
   * If the backend returns a relative URL:
   *
   * /uploads/...
   */
  if (
    url.startsWith("/uploads/")
  ) {
    url = `http://192.168.8.112:5277/api${url}`;
  }

  /*
   * If the backend returns:
   *
   * uploads/...
   */
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/")
  ) {
    url = `http://192.168.8.112:5277/api/v1/uploads/${url}`;
  }

  return url;
};

/**
 * Upload a confession image.
 *
 * Swagger endpoint:
 *
 * POST /api/Uploads/confessions
 *
 * IMPORTANT:
 *
 * We intentionally DO NOT set:
 *
 * Content-Type: multipart/form-data
 *
 * manually.
 *
 * React Native/fetch automatically creates the
 * multipart boundary.
 */
export const uploadConfessionImage = async (
  uri: string
): Promise<string> => {
  if (!uri) {
    throw new Error(
      "No image was selected."
    );
  }

  console.log(
    "Preparing confession image upload..."
  );

  console.log(
    "Image URI:",
    uri
  );

  const formData = new FormData();

  /*
   * Extract filename.
   */
  let fileName =
    uri.split("/").pop() ||
    `confession-${Date.now()}.jpg`;

  /*
   * Remove query parameters.
   */
  fileName =
    fileName.split("?")[0];

  /*
   * Determine extension.
   */
  let extension =
    fileName
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  let mimeType =
    "image/jpeg";

  switch (extension) {
    case "jpg":
    case "jpeg":
      mimeType = "image/jpeg";
      break;

    case "png":
      mimeType = "image/png";
      break;

    case "webp":
      mimeType = "image/webp";
      break;

    case "heic":
      mimeType = "image/heic";
      break;

    default:
      extension = "jpg";

      fileName =
        `confession-${Date.now()}.jpg`;

      mimeType = "image/jpeg";

      break;
  }

  console.log(
    "Upload filename:",
    fileName
  );

  console.log(
    "Upload MIME type:",
    mimeType
  );

  /*
   * React Native FormData file.
   */
  formData.append(
    "file",
    {
      uri,
      name: fileName,
      type: mimeType,
    } as any
  );

  /*
   * IMPORTANT:
   *
   * Swagger says:
   *
   * /api/Uploads/confessions
   *
   * Therefore this MUST use uploadApiRequest,
   * not apiRequest.
   */
  const response =
    await uploadApiRequest(
      "/Uploads/confessions",
      {
        method: "POST",
        body: formData,
      }
    );

  console.log(
    "Upload response:",
    response
  );

  /*
   * Support different possible backend
   * response shapes.
   */
  const returnedImageUrl =
    response?.imageUrl ||
    response?.url ||
    response?.path ||
    response?.fileUrl ||
    response?.data?.imageUrl ||
    response?.data?.url;

  if (
    typeof returnedImageUrl !==
      "string" ||
    !returnedImageUrl
  ) {
    throw new Error(
      "The server did not return an image URL."
    );
  }

  const normalizedUrl =
    normalizeImageUrl(
      returnedImageUrl
    );

  if (!normalizedUrl) {
    throw new Error(
      "The returned image URL is invalid."
    );
  }

  console.log(
    "Original image URL:",
    returnedImageUrl
  );

  console.log(
    "Normalized image URL:",
    normalizedUrl
  );

  return normalizedUrl;
};

/* ============================================================
 * SEARCH
 * ========================================================== */

export type SearchConfessionsQuery = {
  q?: string;
  universityId?: number;
  categoryId?: number;
  tag?: string;
  page?: number;
  pageSize?: number;
};

/* ============================================================
 * CATEGORY / HASHTAG
 * ========================================================== */

export type Category = {
  id: number;
  name: string;
};

export type Hashtag = {
  id: number;
  tag: string;
  usageCount?: number;
};

/* ============================================================
 * COMMENTS
 * ========================================================== */

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

/* ============================================================
 * USER MENTIONS
 * ========================================================== */

export type UserMention = {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string | null;
};

/* ============================================================
 * USER SEARCH
 * ========================================================== */

export const searchUsers = (
  q: string
): Promise<UserMention[]> =>
  apiRequest(
    `/Users/search?q=${encodeURIComponent(q)}`
  );

/* ============================================================
 * GET CONFESSIONS
 * ========================================================== */

export const getConfessions = (
  params?: {
    page?: number;
    pageSize?: number;
  }
) => {
  const queryParams = params
    ? `?${new URLSearchParams(
        params as Record<string, string>
      ).toString()}`
    : "";

  return apiRequest(
    `/Confessions${queryParams}`
  );
};

/* ============================================================
 * SEARCH CONFESSIONS
 * ========================================================== */

export const searchConfessions = (
  query: SearchConfessionsQuery
) => {
  const cleanParams: Record<
    string,
    string
  > = {};

  Object.entries(query).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        cleanParams[key] =
          String(value);
      }
    }
  );

  const queryString =
    new URLSearchParams(
      cleanParams
    ).toString();

  return apiRequest(
    `/Confessions/search${
      queryString
        ? `?${queryString}`
        : ""
    }`
  );
};

/* ============================================================
 * GET SINGLE CONFESSION
 * ========================================================== */

export const getConfession = (
  id: number
) =>
  apiRequest(
    `/Confessions/${id}`
  );

/* ============================================================
 * CREATE CONFESSION
 * ========================================================== */

export const createConfession =
  async (
    payload: CreateConfessionPayload
  ) => {
    /*
     * Do NOT send universityId.
     *
     * Backend gets university from:
     *
     * JWT -> UserId -> Users.UniversityId
     */
    return apiRequest(
      "/Confessions",
      {
        method: "POST",

        body: JSON.stringify({
          categoryId:
            payload.categoryId,

          body:
            payload.body,

          isAnonymous:
            payload.isAnonymous ??
            true,

          scheduledAt:
            payload.scheduledAt ??
            null,

          imageUrl:
            normalizeImageUrl(
              payload.imageUrl
            ),
        }),
      }
    );
  };

/* ============================================================
 * REACTIONS
 * ========================================================== */

export const setReaction = async (
  reactableId: number,
  reactableType:
    | "Confession"
    | "Comment",
  type: ReactionType
) => {
  return apiRequest(
    "/Reactions/set",
    {
      method: "POST",

      body: JSON.stringify({
        reactableId,

        reactableType,

        type:
          REACTION_TYPE_MAP[
            type
          ] ?? 0,
      }),
    }
  );
};

/* ============================================================
 * TOGGLE LIKE
 * ========================================================== */

export type ToggleLikeResponse = {
  isLiked: boolean;
  totalLikes: number;
};

export const toggleLike = async (
  likeableId: number,
  likeableType:
    | "Confession"
    | "Comment"
): Promise<ToggleLikeResponse> => {
  const response =
    await setReaction(
      likeableId,
      likeableType,
      "Like"
    );

  return {
    isLiked:
      response?.userReaction !==
        null &&
      response?.userReaction !==
        undefined,

    totalLikes:
      response?.totalReactions ??
      response?.totalLikes ??
      0,
  };
};

/* ============================================================
 * SAVE
 * ========================================================== */

export const toggleSave = (
  confessionId: number
): Promise<{
  isSaved?: boolean;
}> =>
  apiRequest(
    `/SavedPosts/${confessionId}/toggle`,
    {
      method: "POST",
    }
  );

/* ============================================================
 * SAVED POSTS
 * ========================================================== */

export const getSavedPosts = () =>
  apiRequest(
    "/SavedPosts"
  );

/* ============================================================
 * CATEGORIES
 * ========================================================== */

export const getCategories =
  (): Promise<Category[]> =>
    apiRequest(
      "/Categories"
    );

/* ============================================================
 * TRENDING HASHTAGS
 * ========================================================== */

export const getTrendingHashtags =
  (): Promise<Hashtag[]> =>
    apiRequest(
      "/Hashtags/trending"
    );

/* ============================================================
 * REACTORS
 * ========================================================== */

export const getReactors = (
  reactableId: number,
  reactableType:
    | "Confession"
    | "Comment"
): Promise<ReactionUser[]> =>
  apiRequest(
    `/Reactions/users?reactableId=${reactableId}&reactableType=${reactableType}`
  );

/* ============================================================
 * SHARE
 * ========================================================== */

export const shareConfession = (
  confessionId: number,
  caption?: string
) =>
  apiRequest(
    "/Shares",
    {
      method: "POST",

      body: JSON.stringify({
        confessionId,
        caption,
      }),
    }
  );

/* ============================================================
 * COMMENTS
 * ========================================================== */

export const getComments = (
  confessionId: number,
  page = 1,
  pageSize = 20
): Promise<{
  items: CommentItem[];
}> =>
  apiRequest(
    `/confessions/${confessionId}/comments?page=${page}&pageSize=${pageSize}`
  );

/* ============================================================
 * CREATE COMMENT
 * ========================================================== */

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

        parentId:
          parentId ?? null,
      }),
    }
  );