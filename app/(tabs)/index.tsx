import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
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

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.center}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>U</Text>
          </View>

          <Text style={styles.loadingTitle}>
            UniSecret
          </Text>

          <Text style={styles.loadingText}>
            Connecting to API...
          </Text>

          <ActivityIndicator
            size="large"
            style={styles.loader}
          />
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------
  // ERROR
  // -------------------------

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.center}>

          <View style={styles.errorCircle}>
            <Text style={styles.errorIcon}>!</Text>
          </View>

          <Text style={styles.errorTitle}>
            API Connection Failed
          </Text>

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Text style={styles.errorHelp}>
            Check that your ASP.NET Core API is running
            and that your device can access the API.
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  // -------------------------
  // SUCCESS
  // -------------------------

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>

        {/* Header */}

        <View style={styles.header}>

          <View>
            <Text style={styles.brand}>
              UniSecret
            </Text>

            <Text style={styles.subtitle}>
              API Connection Test
            </Text>
          </View>

          <View style={styles.connectedBadge}>

            <View style={styles.connectedDot} />

            <Text style={styles.connectedText}>
              Connected
            </Text>

          </View>

        </View>

        {/* Success Card */}

        <View style={styles.successCard}>

          <View style={styles.checkCircle}>
            <Text style={styles.check}>
              ✓
            </Text>
          </View>

          <View style={styles.successContent}>

            <Text style={styles.successTitle}>
              API Connection Successful
            </Text>

            <Text style={styles.successDescription}>
              React Native is successfully connected
              to your UniSecret backend.
            </Text>

          </View>

        </View>

        {/* Universities */}

        <Text style={styles.sectionTitle}>
          Universities
        </Text>

        <Text style={styles.sectionSubtitle}>
          Data retrieved from your API
        </Text>

        <FlatList
          data={universities}
          keyExtractor={(item) =>
            item.id.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (

            <View style={styles.card}>

              <View style={styles.universityIcon}>
                <Text style={styles.universityIconText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.universityInfo}>

                <Text
                  style={styles.universityName}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                <Text style={styles.domain}>
                  {item.domain}
                </Text>

              </View>

              <View style={styles.statusBadge}>

                <Text style={styles.statusText}>
                  {item.status}
                </Text>

              </View>

            </View>
          )}
          ListEmptyComponent={

            <View style={styles.emptyCard}>

              <Text style={styles.emptyTitle}>
                No Universities
              </Text>

              <Text style={styles.emptyText}>
                The API is working, but there are
                currently no universities in the database.
              </Text>

            </View>

          }
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  // -------------------------
  // GENERAL
  // -------------------------

  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7F8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F7F7F8",
  },

  // -------------------------
  // LOGO
  // -------------------------

  logo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },

  loadingTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111111",
  },

  loadingText: {
    marginTop: 8,
    color: "#777777",
    fontSize: 15,
  },

  loader: {
    marginTop: 20,
  },

  // -------------------------
  // HEADER
  // -------------------------

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 24,
  },

  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111111",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#777777",
  },

  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#E9F9F0",
  },

  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },

  connectedText: {
    color: "#15803D",
    fontSize: 12,
    fontWeight: "700",
  },

  // -------------------------
  // SUCCESS
  // -------------------------

  successCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginBottom: 30,
  },

  checkCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E9F9F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  check: {
    color: "#16A34A",
    fontSize: 23,
    fontWeight: "800",
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 5,
  },

  successDescription: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
  },

  // -------------------------
  // SECTION
  // -------------------------

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111111",
  },

  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 15,
    fontSize: 13,
    color: "#777777",
  },

  list: {
    paddingBottom: 30,
  },

  // -------------------------
  // UNIVERSITY CARD
  // -------------------------

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },

  universityIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  universityIconText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  universityInfo: {
    flex: 1,
  },

  universityName: {
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },

  domain: {
    color: "#777777",
    fontSize: 13,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#E9F9F0",
    marginLeft: 8,
  },

  statusText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "700",
  },

  // -------------------------
  // EMPTY
  // -------------------------

  emptyCard: {
    padding: 25,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    alignItems: "center",
  },

  emptyTitle: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "700",
  },

  emptyText: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 7,
  },

  // -------------------------
  // ERROR
  // -------------------------

  errorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FEECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  errorIcon: {
    fontSize: 30,
    fontWeight: "800",
    color: "#DC2626",
  },

  errorTitle: {
    color: "#111111",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
  },

  errorMessage: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },

  errorHelp: {
    color: "#777777",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

});