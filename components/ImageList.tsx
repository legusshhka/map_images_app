// components/ImageList.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageData } from "../types";

interface ImageListProps {
  images: ImageData[];
  onAddImage: (uri: string) => void;
  onRemoveImage: (imageId: string) => void;
}

export default function ImageList({
  images,
  onAddImage,
  onRemoveImage,
}: ImageListProps) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      setLoading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Нет доступа",
          "Разрешите доступ к галерее в настройках, чтобы добавлять изображения.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      result.assets.forEach((asset) => {
        if (asset.uri) onAddImage(asset.uri);
      });
    } catch (err) {
      Alert.alert("Ошибка", "Не удалось выбрать изображение");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (imageId: string) => {
    Alert.alert("Удалить изображение?", "Действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => onRemoveImage(imageId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Изображения ({images.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={pickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.addButtonText}>+ Добавить</Text>
          )}
        </TouchableOpacity>
      </View>

      {images.length === 0 ? (
        <Text style={styles.emptyText}>Пока нет изображений</Text>
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.imageWrapper}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => confirmRemove(item.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "600" },
  addButton: {
    backgroundColor: "#1976d2",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyText: { color: "#888", fontStyle: "italic" },
  imageWrapper: {
    width: "31%",
    marginRight: "3.5%",
    marginBottom: 12,
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
});
