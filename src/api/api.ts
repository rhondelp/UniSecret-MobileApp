import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.8.112:5277/api/v1";
const API_ROOT = "http://192.168.8.112:5277/api";

/* ============================================================
 * SHARED REQUEST HANDLER
 * ========================================================== */

const buildHeaders = async (
  options: RequestInit,
  isFormData: boolean
): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem("token");

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  /*
   * IMPORTANT:
   *
   * Do NOT manually set Content-Type when using FormData.
   *
   * React Native fetch needs to generate:
   *
   * multipart/form-data; boundary=....
   *
   * automatically.
   */
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  /*
   * Copy custom headers.
   */
  if (options.headers) {
    const customHeaders = new Headers(options.headers);

    customHeaders.forEach((value, key) => {
      /*
       * Never allow a manually supplied Content-Type
       * to override the multipart boundary.
       */
      if (
        isFormData &&
        key.toLowerCase() === "content-type"
      ) {
        return;
      }

      headers[key] = value;
    });
  }

  /*
   * Add JWT.
   */
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/* ============================================================
 * PARSE RESPONSE
 * ========================================================== */

const parseResponse = async (
  response: Response
): Promise<any> => {
  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response
      .json()
      .catch(() => null);
  } else {
    const text = await response
      .text()
      .catch(() => "");

    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }

  return data;
};

/* ============================================================
 * GET ERROR MESSAGE
 * ========================================================== */

const getErrorMessage = (
  data: any,
  status: number,
  fallback: string
): string => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data?.message) {
    return String(data.message);
  }

  if (data?.title) {
    return String(data.title);
  }

  if (data?.error) {
    return String(data.error);
  }

  if (data?.detail) {
    return String(data.detail);
  }

  return `${fallback} with status ${status}`;
};

/* ============================================================
 * NORMAL API REQUEST
 *
 * Uses:
 *
 * /api/v1/...
 *
 * Examples:
 *
 * /api/v1/Universities
 * /api/v1/Confessions
 * /api/v1/Reactions/set
 * ========================================================== */

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    const headers = await buildHeaders(
      options,
      isFormData
    );

    const url = `${API_URL}${endpoint}`;

    console.log("================================");
    console.log("API REQUEST");
    console.log("URL:", url);
    console.log(
      "METHOD:",
      options.method || "GET"
    );
    console.log(
      "BODY TYPE:",
      isFormData ? "FormData" : "JSON"
    );
    console.log(
      "HAS TOKEN:",
      !!headers.Authorization
    );
    console.log("================================");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await parseResponse(response);

    console.log(
      "API STATUS:",
      response.status
    );

    console.log(
      "API RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          response.status,
          "Request failed"
        )
      );
    }

    return data;
  } catch (error) {
    console.error(
      "================================"
    );

    console.error("API ERROR");

    console.error(
      "ERROR:",
      error
    );

    console.error(
      "================================"
    );

    throw error;
  }
};

/* ============================================================
 * UPLOAD API REQUEST
 *
 * Uses:
 *
 * /api/...
 *
 * This is specifically required for Swagger endpoints such as:
 *
 * /api/Uploads/confessions
 *
 * NOT:
 *
 * /api/v1/uploads/confessions
 * ========================================================== */

export const uploadApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  try {
    const isFormData =
      typeof FormData !== "undefined" &&
      options.body instanceof FormData;

    const headers = await buildHeaders(
      options,
      isFormData
    );

    const url = `${API_ROOT}${endpoint}`;

    console.log("================================");
    console.log("UPLOAD REQUEST");
    console.log("URL:", url);
    console.log(
      "METHOD:",
      options.method || "GET"
    );
    console.log(
      "BODY TYPE:",
      isFormData ? "FormData" : "JSON"
    );
    console.log(
      "HAS TOKEN:",
      !!headers.Authorization
    );
    console.log("================================");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await parseResponse(response);

    console.log(
      "UPLOAD STATUS:",
      response.status
    );

    console.log(
      "UPLOAD RESPONSE:",
      data
    );

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          response.status,
          "Upload failed"
        )
      );
    }

    return data;
  } catch (error) {
    console.error(
      "================================"
    );

    console.error("UPLOAD ERROR");

    console.error(
      "ENDPOINT:",
      endpoint
    );

    console.error(
      "ERROR:",
      error
    );

    console.error(
      "================================"
    );

    throw error;
  }
};

/* ============================================================
 * EXPORT API URL
 * ========================================================== */

export { API_URL };