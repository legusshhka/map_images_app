import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatabaseProvider } from "../contexts/DatabaseContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Карта" }} />
          <Stack.Screen name="marker/[id]" options={{ title: "Маркер" }} />
        </Stack>
        <StatusBar style="auto" />
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
