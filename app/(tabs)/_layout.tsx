import React from "react";

import { Tabs } from "expo-router";

export default function TabsLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#999999",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopColor: "#E5E5E5",
          backgroundColor: "#FFFFFF",
        },
      }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: "Home",

          tabBarIcon: () => null,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "Create",

          tabBarIcon: () => null,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",

          tabBarIcon: () => null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",

          tabBarIcon: () => null,
        }}
      />

    </Tabs>
  );
}