import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useDatabase } from "../contexts/DatabaseContext";
import { Marker as DbMarker } from "../database/operations";

export default function MarkerList() {
  const { getMarkers, getMarkerImages, isLoading } = useDatabase();
  const router = useRouter();
  const [markers, setMarkers] = useState<DbMarker[]>([]);
  const [imageCounts, setImageCounts] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (isLoading) return;
        try {
          const data = await getMarkers();
          if (!active) return;
          setMarkers(data);
          const counts: Record<number, number> = {};
          for (const m of data) {
            const imgs = await getMarkerImages(m.id);
            counts[m.id] = imgs.length;
          }
          if (active) setImageCounts(counts);
        } catch {
          if (active)
            Alert.alert("Ошибка", "Не удалось загрузить список маркеров");
        }
      })();
      return () => {
        active = false;
      };
    }, [getMarkers, getMarkerImages, isLoading]),
  );

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
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/marker/${item.id}`)}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              Маркер #{item.id}
            </Text>
            <Text style={styles.cardCoords}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
            <Text style={styles.cardImages}>
              Изображений: {imageCounts[item.id] ?? 0}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 12 },
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
