// components/Map.tsx
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Alert, TouchableOpacity } from "react-native";
import MapView, { Marker, LongPressEvent } from "react-native-maps";
import { useRouter } from "expo-router";
import { useMarkers } from "../context/MarkersContext";

const MAP_LOAD_TIMEOUT_MS = 8000;

export default function Map() {
  const { markers, addMarker } = useMarkers();
  const router = useRouter();
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMapReady(false);
    setMapFailed(false);
    timeoutRef.current = setTimeout(() => {
      setMapFailed(true);
    }, MAP_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [reloadKey]);

  const handleMapReady = () => {
    setMapReady(true);
    setMapFailed(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleLongPress = (event: LongPressEvent) => {
    try {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      addMarker({ latitude, longitude });
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось добавить маркер");
    }
  };

  const handleMarkerPress = (markerId: string) => {
    try {
      router.push(`/marker/${markerId}`);
    } catch {
      Alert.alert("Ошибка навигации", "Не удалось открыть маркер");
    }
  };

  const retry = () => setReloadKey((k) => k + 1);

  return (
    <View style={styles.container}>
      <MapView
        key={reloadKey}
        style={styles.map}
        initialRegion={{
          latitude: 55.751244,
          longitude: 37.618423,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onLongPress={handleLongPress}
        onMapReady={handleMapReady}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}
      </MapView>

      {!mapReady && !mapFailed && (
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>Загрузка карты…</Text>
        </View>
      )}

      {mapFailed && (
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Карта не загрузилась</Text>
          <Text style={styles.overlayHint}>
            Проверьте интернет-соединение или повторите попытку
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  overlayText: { fontSize: 15, color: "#555" },
  overlayTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#d32f2f",
    marginBottom: 6,
  },
  overlayHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600" },
});
