import { apiRequest } from "./api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  username: string;
  email: string;
  password: string;
  universityId: number;
};

/**
 * LOGIN
 */
export const loginUser = async (
  data: LoginRequest
) => {
  return apiRequest("/Auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * REGISTER
 */
export const registerUser = async (
  data: RegisterRequest
) => {
  return apiRequest("/Auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};