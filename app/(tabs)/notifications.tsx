import React from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from "react-native";

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>♧</Text>
      </View>

      <Text style={styles.title}>Notifications</Text>

      <Text style={styles.text}>
        Your activity, mentions, and updates will appear here.
      </Text>
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
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#16161A",
    borderWidth: 1.5,
    borderColor: "#EAB308",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#EAB308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 28,
    color: "#EAB308",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F4F4F5",
    letterSpacing: -0.4,
  },
  text: {
    marginTop: 8,
    color: "#A1A1AA",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});