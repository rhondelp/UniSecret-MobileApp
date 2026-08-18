import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  universityId: number;
};

export type AuthResponse = {
  token?: string;
  accessToken?: string;
  user?: User;
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  universityId?: number;
  data?: {
    token?: string;
    accessToken?: string;
    user?: User;
    universityId?: number;
  };
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (authData: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load stored auth state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (authData: AuthResponse) => {
    const extractedToken =
      authData?.token ??
      authData?.accessToken ??
      authData?.data?.token ??
      authData?.data?.accessToken;

    const extractedUser: User | null =
      authData?.user ??
      authData?.data?.user ??
      (authData?.id && authData?.email
        ? {
            id: authData.id,
            name: authData.name ?? "",
            username: authData.username ?? "",
            email: authData.email,
            universityId: authData.universityId ?? authData.data?.universityId ?? 0,
          }
        : null);

    if (!extractedToken) {
      throw new Error("No authentication token found in response.");
    }

    setToken(extractedToken);
    await AsyncStorage.setItem("token", extractedToken);

    if (extractedUser) {
      setUser(extractedUser);
      await AsyncStorage.setItem("user", JSON.stringify(extractedUser));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      setToken(null);
      setUser(null);
      router.replace("/login" as const);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};