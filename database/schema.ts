import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "markers.db";
const DATABASE_VERSION = 1;

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await db.execAsync("PRAGMA journal_mode = WAL;");

    const result = await db.getFirstAsync<{ user_version: number }>(
      "PRAGMA user_version",
    );
    const currentVersion = result?.user_version ?? 0;

    if (currentVersion < DATABASE_VERSION) {
      await migrate(db, currentVersion);
      await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    }

    if (__DEV__) {
      console.log("[DB] Инициализация завершена, версия:", DATABASE_VERSION);
    }
  } catch (error) {
    console.error("[DB] Ошибка инициализации:", error);
    throw error;
  }
}

async function migrate(
  db: SQLite.SQLiteDatabase,
  fromVersion: number,
): Promise<void> {
  if (fromVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS markers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS marker_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        marker_id INTEGER NOT NULL,
        uri TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
      );
    `);

    if (__DEV__) console.log("[DB] Миграция 0 -> 1: таблицы созданы");
  }
}

export { DATABASE_NAME, DATABASE_VERSION };
