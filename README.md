# Лабораторная работа №2 — карта с локальной БД

Приложение на React Native + Expo: маркеры на карте, изображения из галереи, хранение в SQLite. Данные сохраняются между запусками.

## Стек

- Expo SDK 58, React Native 0.88, TypeScript
- Expo Router, react-native-maps, expo-image-picker, expo-sqlite

## Запуск

Требуется Node.js (LTS) и Expo Go на Android (или эмулятор Android Studio).

```

npm install
npx expo start -c --android

```

База создаётся автоматически при первом запуске.

## Функциональность

- Добавление маркера долгим нажатием на карту
- Список маркеров с координатами и количеством изображений
- Экран деталей: добавление изображений из галереи (мультивыбор), удаление
- Удаление маркера с каскадным удалением изображений
- Персистентность данных между запусками

## Схема БД

Файл `markers.db`.

```sql
CREATE TABLE markers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marker_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  marker_id INTEGER NOT NULL,
  uri TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marker_id) REFERENCES markers (id) ON DELETE CASCADE
);
```

Связь `markers 1 → N marker_images`. Каскадное удаление работает за счёт `PRAGMA foreign_keys = ON`, который включается при открытии БД (в SQLite внешние ключи по умолчанию выключены). Также включён `PRAGMA journal_mode = WAL` для производительности.

## Миграции

Версия хранится в `PRAGMA user_version`, целевая версия — константа `DATABASE_VERSION` в `database/schema.ts`. При старте: включение PRAGMA → чтение `user_version` → если меньше целевой, выполняется `migrate()` и версия обновляется. Сейчас версия 1 — создание таблиц. Новая миграция добавляется блоком `if (fromVersion < N)` с инкрементом `DATABASE_VERSION`.

## Структура

```
app/
  _layout.tsx          — DatabaseProvider + Stack
  index.tsx            — экран карты
  marker/[id].tsx      — экран деталей
components/
  Map.tsx
  MarkerList.tsx
  ImageList.tsx
contexts/
  DatabaseContext.tsx  — провайдер и хук useDatabase()
database/
  schema.ts            — открытие, PRAGMA, миграции
  operations.ts        — CRUD-функции
  migrations/index.ts
types.ts
```

Разделение слоёв: `operations.ts` — чистые функции, принимают `db` первым аргументом, не зависят от React. `DatabaseContext` оборачивает их и отдаёт компонентам через `useDatabase()`. Компоненты не работают с SQL напрямую.

## Обработка ошибок

- **Инициализация БД** — `try/catch` в провайдере, состояние `error`, метод `retryInit()` для повторной попытки.
- **CRUD-операции** — `try/catch` в каждой функции `operations.ts`, логирование и проброс наверх; в UI — `Alert` с понятным текстом.
- **Размонтирование** — флаги `isMounted`/`cancelled` в `useEffect`, чтобы не обновлять state после unmount.
- **Транзакции** — каскадное удаление атомарно на уровне FK, отдельная транзакция не требуется; для будущих многотабличных операций предусмотрен `withTransactionAsync`.
- **Логирование** — только в `__DEV__`.
- **Некорректный id маркера** — экран «Маркер не найден» с кнопкой возврата.

## ORM

Не используется. Для двух таблиц `expo-sqlite` достаточно: схема и запросы видны явно, нет лишних зависимостей и генерации миграций. ORM (Drizzle/Prisma) оправдан при большем числе таблиц и сложных связях.

## Дополнительно

- `retryInit()` для восстановления после ошибки инициализации
- WAL-режим
- Параметризованные запросы (защита от SQL-инъекций)
- Доменные типы `Marker`/`MarkerImage`, изолированные от `snake_case` схемы
- Перезагрузка данных через `useFocusEffect` при возврате на экран
- Подтверждение перед удалением маркера и изображения

## Ограничения

- Изображения хранятся как URI из галереи; при очистке кэша Expo Go URI могут стать недоступны. Для production требуется копирование в `FileSystem.documentDirectory`.
- Координаты на экране деталей не отображаются: интерфейс `DatabaseContextType` из задания не включает `getMarkerById`.
