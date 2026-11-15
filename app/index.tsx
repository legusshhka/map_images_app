import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Map from "../components/Map";
import MarkerList from "../components/MarkerList";

export default function MapScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Map />
      <View style={[styles.listWrapper, { paddingBottom: insets.bottom }]}>
        <MarkerList />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listWrapper: { position: "absolute", left: 0, right: 0, bottom: 0 },
});
