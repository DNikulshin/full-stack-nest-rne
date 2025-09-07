import React from "react";
import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/shared/design-system";

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.ligth,
        tabBarItemStyle: {},
        tabBarStyle: {
          backgroundColor: Colors.secondary,
          borderRadius: 50,
          height: "auto",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
