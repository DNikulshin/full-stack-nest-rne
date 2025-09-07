import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Colors } from "@/shared/design-system";
import "./global.css";

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.primary, 
    card: Colors.primary
  },
};

export default function RootLayout() {
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
        <ThemeProvider value={AppTheme}>
          <Stack
            screenOptions={{
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </SafeAreaView>
    </>
  );
}
