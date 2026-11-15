import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MarkersProvider } from "../context/MarkersContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MarkersProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Карта" }} />
          <Stack.Screen name="marker/[id]" options={{ title: "Маркер" }} />
        </Stack>
        <StatusBar style="auto" />
      </MarkersProvider>
    </SafeAreaProvider>
  );
}
