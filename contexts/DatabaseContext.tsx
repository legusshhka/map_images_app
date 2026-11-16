import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";
import { DATABASE_NAME, initDatabase } from "../database/schema";
import {
  addImage as dbAddImage,
  addMarker as dbAddMarker,
  deleteImage as dbDeleteImage,
  deleteMarker as dbDeleteMarker,
  getMarkerImages as dbGetMarkerImages,
  getMarkers as dbGetMarkers,
  Marker,
  MarkerImage,
} from "../database/operations";

interface DatabaseContextType {
  addMarker: (latitude: number, longitude: number) => Promise<number>;
  deleteMarker: (id: number) => Promise<void>;
  getMarkers: () => Promise<Marker[]>;
  addImage: (markerId: number, uri: string) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
  getMarkerImages: (markerId: number) => Promise<MarkerImage[]>;

  isLoading: boolean;
  error: Error | null;
  retryInit: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined,
);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initAttempt, setInitAttempt] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
        await initDatabase(database);
        if (!cancelled && isMounted.current) {
          setDb(database);
        }
      } catch (e) {
        const err =
          e instanceof Error ? e : new Error("Ошибка инициализации БД");
        console.error("[DatabaseProvider] init error:", err);
        if (!cancelled && isMounted.current) {
          setError(err);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initAttempt]);

  const withDb = useCallback(
    async <T,>(
      fn: (database: SQLite.SQLiteDatabase) => Promise<T>,
    ): Promise<T> => {
      if (!db) {
        throw new Error("База данных ещё не инициализирована");
      }
      return fn(db);
    },
    [db],
  );

  const addMarker = useCallback(
    (latitude: number, longitude: number) =>
      withDb((database) => dbAddMarker(database, latitude, longitude)),
    [withDb],
  );

  const deleteMarker = useCallback(
    (id: number) => withDb((database) => dbDeleteMarker(database, id)),
    [withDb],
  );

  const getMarkers = useCallback(
    () => withDb((database) => dbGetMarkers(database)),
    [withDb],
  );

  const addImage = useCallback(
    async (markerId: number, uri: string) => {
      await withDb((database) => dbAddImage(database, markerId, uri));
    },
    [withDb],
  );

  const deleteImage = useCallback(
    (id: number) => withDb((database) => dbDeleteImage(database, id)),
    [withDb],
  );

  const getMarkerImages = useCallback(
    (markerId: number) =>
      withDb((database) => dbGetMarkerImages(database, markerId)),
    [withDb],
  );

  const retryInit = useCallback(() => setInitAttempt((n) => n + 1), []);

  const value = useMemo<DatabaseContextType>(
    () => ({
      addMarker,
      deleteMarker,
      getMarkers,
      addImage,
      deleteImage,
      getMarkerImages,
      isLoading,
      error,
      retryInit,
    }),
    [
      addMarker,
      deleteMarker,
      getMarkers,
      addImage,
      deleteImage,
      getMarkerImages,
      isLoading,
      error,
      retryInit,
    ],
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextType {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return ctx;
}
