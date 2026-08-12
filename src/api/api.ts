import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.8.112:5277/api/v1";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    // Get saved JWT token
    const token = await AsyncStorage.getItem("token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    };

    // Add JWT if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;

    console.log("================================");
    console.log("API REQUEST");
    console.log("URL:", url);
    console.log("METHOD:", options.method || "GET");
    console.log("================================");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    console.log("API STATUS:", response.status);
    console.log("API RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          data?.title ||
          data?.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;

  } catch (error) {

    console.error("================================");
    console.error("API ERROR");
    console.error(error);
    console.error("================================");

    throw error;
  }
};
