import * as SQLite from "expo-sqlite";

interface MarkerRow {
  id: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

interface MarkerImageRow {
  id: number;
  marker_id: number;
  uri: string;
  created_at: string;
}

export interface Marker {
  id: number;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface MarkerImage {
  id: number;
  markerId: number;
  uri: string;
  createdAt: string;
}

function mapMarker(row: MarkerRow): Marker {
  return {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
  };
}

function mapImage(row: MarkerImageRow): MarkerImage {
  return {
    id: row.id,
    markerId: row.marker_id,
    uri: row.uri,
    createdAt: row.created_at,
  };
}

function logDev(...args: unknown[]) {
  if (__DEV__) console.log("[DB]", ...args);
}

export async function addMarker(
  db: SQLite.SQLiteDatabase,
  latitude: number,
  longitude: number,
): Promise<number> {
  try {
    const result = await db.runAsync(
      "INSERT INTO markers (latitude, longitude) VALUES (?, ?);",
      latitude,
      longitude,
    );
    logDev("addMarker -> id", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("[DB] addMarker error:", error);
    throw error;
  }
}

export async function deleteMarker(
  db: SQLite.SQLiteDatabase,
  id: number,
): Promise<void> {
  try {
    await db.runAsync("DELETE FROM markers WHERE id = ?;", id);
    logDev("deleteMarker -> id", id);
  } catch (error) {
    console.error("[DB] deleteMarker error:", error);
    throw error;
  }
}

export async function getMarkers(db: SQLite.SQLiteDatabase): Promise<Marker[]> {
  try {
    const rows = await db.getAllAsync<MarkerRow>(
      "SELECT * FROM markers ORDER BY created_at DESC;",
    );
    return rows.map(mapMarker);
  } catch (error) {
    console.error("[DB] getMarkers error:", error);
    throw error;
  }
}

export async function addImage(
  db: SQLite.SQLiteDatabase,
  markerId: number,
  uri: string,
): Promise<number> {
  try {
    const result = await db.runAsync(
      "INSERT INTO marker_images (marker_id, uri) VALUES (?, ?);",
      markerId,
      uri,
    );
    logDev("addImage -> id", result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("[DB] addImage error:", error);
    throw error;
  }
}

export async function deleteImage(
  db: SQLite.SQLiteDatabase,
  id: number,
): Promise<void> {
  try {
    await db.runAsync("DELETE FROM marker_images WHERE id = ?;", id);
    logDev("deleteImage -> id", id);
  } catch (error) {
    console.error("[DB] deleteImage error:", error);
    throw error;
  }
}

export async function getMarkerImages(
  db: SQLite.SQLiteDatabase,
  markerId: number,
): Promise<MarkerImage[]> {
  try {
    const rows = await db.getAllAsync<MarkerImageRow>(
      "SELECT * FROM marker_images WHERE marker_id = ? ORDER BY created_at ASC;",
      markerId,
    );
    return rows.map(mapImage);
  } catch (error) {
    console.error("[DB] getMarkerImages error:", error);
    throw error;
  }
}
