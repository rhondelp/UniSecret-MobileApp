import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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

    id?: number;
    name?: string;
    username?: string;
    email?: string;
    universityId?: number;
  };

  message?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  login: (
    authData: AuthResponse
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* ========================================================
   * LOAD STORED AUTH
   * ====================================================== */

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken =
        await AsyncStorage.getItem(
          "token"
        );

      const storedUser =
        await AsyncStorage.getItem(
          "user"
        );

      console.log(
        "AUTH STORAGE TOKEN:",
        !!storedToken
      );

      if (
        storedToken &&
        storedUser
      ) {
        try {
          const parsedUser =
            JSON.parse(
              storedUser
            );

          setToken(storedToken);
          setUser(parsedUser);

          console.log(
            "AUTH USER:",
            parsedUser
          );
        } catch (error) {
          console.error(
            "Invalid stored user:",
            error
          );

          await AsyncStorage.multiRemove([
            "token",
            "user",
          ]);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load stored auth state:",
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ========================================================
   * LOGIN
   * ====================================================== */

  const login = async (
    authData: AuthResponse
  ) => {
    /*
     * Your backend returns:
     *
     * {
     *   data: {
     *      token,
     *      id,
     *      name,
     *      username,
     *      email,
     *      universityId
     *   }
     * }
     */

    const data =
      authData?.data ?? authData;

    const extractedToken =
      authData?.token ??
      authData?.accessToken ??
      authData?.data?.token ??
      authData?.data?.accessToken;

    if (!extractedToken) {
      throw new Error(
        "No authentication token found in response."
      );
    }

    const extractedUser: User | null =
      authData?.user ??
      authData?.data?.user ??
      (data?.id &&
      data?.email
        ? {
            id: data.id,

            name:
              data.name ??
              "",

            username:
              data.username ??
              "",

            email:
              data.email,

            universityId:
              data.universityId ??
              0,
          }
        : null);

    if (!extractedUser) {
      throw new Error(
        "No authenticated user found in response."
      );
    }

    /*
     * Update React state first.
     */
    setToken(
      extractedToken
    );

    setUser(
      extractedUser
    );

    /*
     * Persist authentication.
     */
    await AsyncStorage.setItem(
      "token",
      extractedToken
    );

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(
        extractedUser
      )
    );

    console.log(
      "AUTH USER:",
      extractedUser
    );
  };

  /* ========================================================
   * LOGOUT
   * ====================================================== */

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "token",
        "user",
      ]);

      setToken(null);
      setUser(null);

      router.replace(
        "/login" as const
      );
    } catch (error) {
      console.error(
        "Error during logout:",
        error
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};