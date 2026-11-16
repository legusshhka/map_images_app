import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useDatabase } from "../../contexts/DatabaseContext";
import { MarkerImage } from "../../database/operations";
import ImageList from "../../components/ImageList";

export default function MarkerDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const markerId = Number(params.id);
  const router = useRouter();
  const { getMarkerImages, addImage, deleteImage, deleteMarker, isLoading } =
    useDatabase();

  const [images, setImages] = useState<MarkerImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadImages = useCallback(async () => {
    if (!Number.isFinite(markerId)) {
      setNotFound(true);
      setLoadingImages(false);
      return;
    }
    try {
      setLoadingImages(true);
      const data = await getMarkerImages(markerId);
      setImages(data);
      setNotFound(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Ошибка", "Не удалось загрузить изображения");
    } finally {
      setLoadingImages(false);
    }
  }, [getMarkerImages, markerId]);

  useFocusEffect(
    useCallback(() => {
      if (!isLoading) loadImages();
    }, [isLoading, loadImages]),
  );

  const handleAdd = async (uri: string) => {
    try {
      await addImage(markerId, uri);
      await loadImages();
    } catch {
      Alert.alert("Ошибка", "Не удалось добавить изображение");
    }
  };

  const handleRemove = async (imageId: number) => {
    try {
      await deleteImage(imageId);
      await loadImages();
    } catch {
      Alert.alert("Ошибка", "Не удалось удалить изображение");
    }
  };

  const handleDeleteMarker = () => {
    Alert.alert(
      "Удалить маркер?",
      "Все связанные изображения тоже будут удалены",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMarker(markerId);
              router.back();
            } catch {
              Alert.alert("Ошибка", "Не удалось удалить маркер");
            }
          },
        },
      ],
    );
  };

  if (notFound) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Маркер не найден</Text>
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>Маркер #{markerId}</Text>
          <TouchableOpacity onPress={handleDeleteMarker}>
            <Text style={styles.deleteLink}>Удалить</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loadingImages ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <ImageList
          images={images}
          onAddImage={handleAdd}
          onRemoveImage={handleRemove}
        />
      )}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  deleteLink: { color: "#d32f2f", fontWeight: "600" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  notFoundTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  backButton: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "600" },
});
