import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { apiRequest } from "../../src/api/api";

type University = {
  id: number;
  name: string;
  domain: string;
  logoUrl?: string | null;
  status: string;
  createdAt: string;
};

export default function FeedScreen() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testApi();
  }, []);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Testing UniSecret API...");

      const data = await apiRequest("/Universities");

      console.log("API Response:", data);

      setUniversities(data);
    } catch (error) {
      console.error("API Error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to connect to API.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.text}>
          Connecting to UniSecret API...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>
          API Connection Failed
        </Text>

        <Text style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        UniSecret
      </Text>

      <Text style={styles.subtitle}>
        API Connection Successful
      </Text>

      <Text style={styles.heading}>
        Universities
      </Text>

      <FlatList
        data={universities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.universityName}>
              {item.name}
            </Text>

            <Text style={styles.domain}>
              {item.domain}
            </Text>

            <Text>
              Status: {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 25,
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  text: {
    marginTop: 15,
  },

  error: {
    marginTop: 10,
    textAlign: "center",
  },

  card: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },

  universityName: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 5,
  },

  domain: {
    marginBottom: 5,
  },
});