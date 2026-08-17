import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.infoBox}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F8", justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#111111" },
  infoBox: { marginTop: 16, alignItems: "center" },
  name: { fontSize: 18, fontWeight: "700", color: "#111111" },
  username: { fontSize: 14, color: "#666666", marginTop: 2 },
  email: { fontSize: 13, color: "#888888", marginTop: 4 },
  logoutButton: { marginTop: 30, backgroundColor: "#EF4444", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  logoutText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});