// app/marker/[id].tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMarkers } from "../../context/MarkersContext";
import ImageList from "../../components/ImageList";

export default function MarkerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMarker, addImage, removeImage } = useMarkers();
  const router = useRouter();

  const marker = id ? getMarker(id) : undefined;

  if (!marker) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Маркер не найден</Text>
        <Text style={styles.notFoundHint}>
          Возможно, он был удалён или ссылка некорректна
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Назад к карте</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{marker.title}</Text>
        <Text style={styles.label}>Координаты:</Text>
        <Text style={styles.coords}>
          Широта: {marker.coordinate.latitude.toFixed(6)}
        </Text>
        <Text style={styles.coords}>
          Долгота: {marker.coordinate.longitude.toFixed(6)}
        </Text>
      </View>

      <ImageList
        images={marker.images}
        onAddImage={(uri) => addImage(marker.id, uri)}
        onRemoveImage={(imageId) => removeImage(marker.id, imageId)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: { fontSize: 13, color: "#888", marginBottom: 4 },
  coords: { fontSize: 14, color: "#333", marginBottom: 2 },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  notFoundTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  notFoundHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "600" },
});
