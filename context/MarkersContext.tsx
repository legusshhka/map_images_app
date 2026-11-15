import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ImageData, MarkerData } from "../types";

interface MarkersContextValue {
  markers: MarkerData[];
  addMarker: (coordinate: MarkerData["coordinate"]) => MarkerData;
  getMarker: (id: string) => MarkerData | undefined;
  addImage: (markerId: string, uri: string) => void;
  removeImage: (markerId: string, imageId: string) => void;
}

const MarkersContext = createContext<MarkersContextValue | undefined>(
  undefined,
);

export function MarkersProvider({ children }: { children: React.ReactNode }) {
  const [markers, setMarkers] = useState<MarkerData[]>([]);

  const addMarker = useCallback(
    (coordinate: MarkerData["coordinate"]): MarkerData => {
      const newMarker: MarkerData = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        coordinate,
        title: `Маркер ${new Date().toLocaleTimeString()}`,
        images: [],
      };
      setMarkers((prev) => [...prev, newMarker]);
      return newMarker;
    },
    [],
  );

  const getMarker = useCallback(
    (id: string) => markers.find((m) => m.id === id),
    [markers],
  );

  const addImage = useCallback((markerId: string, uri: string) => {
    const newImage: ImageData = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      uri,
    };
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === markerId ? { ...m, images: [...m.images, newImage] } : m,
      ),
    );
  }, []);

  const removeImage = useCallback((markerId: string, imageId: string) => {
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === markerId
          ? { ...m, images: m.images.filter((img) => img.id !== imageId) }
          : m,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({ markers, addMarker, getMarker, addImage, removeImage }),
    [markers, addMarker, getMarker, addImage, removeImage],
  );

  return (
    <MarkersContext.Provider value={value}>{children}</MarkersContext.Provider>
  );
}

export function useMarkers(): MarkersContextValue {
  const ctx = useContext(MarkersContext);
  if (!ctx) {
    throw new Error("useMarkers must be used within a MarkersProvider");
  }
  return ctx;
}
