import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.8.112:5277/api/v1";

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await SecureStore.getItemAsync("token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};