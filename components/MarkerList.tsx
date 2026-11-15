import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useMarkers } from "../context/MarkersContext";

export default function MarkerList() {
  const { markers } = useMarkers();
  const router = useRouter();

  if (markers.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Долгое нажатие на карту добавляет маркер
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={markers}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/marker/${item.id}`)}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardCoords}>
              {item.coordinate.latitude.toFixed(4)},{" "}
              {item.coordinate.longitude.toFixed(4)}
            </Text>
            <Text style={styles.cardImages}>
              Изображений: {item.images.length}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  listContent: { paddingHorizontal: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 160,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  cardCoords: { fontSize: 12, color: "#666", marginBottom: 4 },
  cardImages: { fontSize: 12, color: "#1976d2" },
  emptyContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  emptyText: { fontSize: 13, color: "#666" },
});
