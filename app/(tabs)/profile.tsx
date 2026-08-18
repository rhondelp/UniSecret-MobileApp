import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* AVATAR BADGE */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {(user?.name || user?.username || "U").charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text style={styles.title}>Profile</Text>

      {user && (
        <View style={styles.infoCard}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <View style={styles.divider} />
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: "#16161A",
    borderWidth: 1.5,
    borderColor: "#EAB308",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarText: {
    color: "#EAB308",
    fontSize: 34,
    fontWeight: "900",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F4F4F5",
    letterSpacing: -0.4,
  },
  infoCard: {
    marginTop: 20,
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#16161A",
    borderWidth: 1,
    borderColor: "#27272A",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F4F4F5",
  },
  username: {
    fontSize: 14,
    color: "#EAB308",
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    height: 1,
    width: "100%",
    backgroundColor: "#27272A",
    marginVertical: 14,
  },
  email: {
    fontSize: 13,
    color: "#A1A1AA",
  },
  logoutButton: {
    marginTop: 28,
    width: "100%",
    maxWidth: 380,
    height: 50,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 15,
  },
});