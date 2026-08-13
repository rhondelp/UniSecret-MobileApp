import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function NotificationsScreen() {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Notifications
      </Text>

      <Text style={styles.text}>
        Your notifications will appear here.
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F7F7F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111111",
  },

  text: {
    marginTop: 8,
    color: "#888888",
  },

});