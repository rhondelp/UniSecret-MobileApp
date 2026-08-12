import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.8.112:5277/api/v1";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    const token = await SecureStore.getItemAsync("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add any custom headers passed to the request
    if (options.headers) {
      const customHeaders = new Headers(options.headers);

      customHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    }

    // Add JWT token if available
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("API Request:", `${API_URL}${endpoint}`);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    console.log("API Status:", response.status);
    console.log("API Response:", data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Request Error:", error);

    throw error;
  }
};