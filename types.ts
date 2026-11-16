export interface ImageData {
  id: number;
  uri: string;
}

export interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export type MarkerDetailsParams = {
  id: string;
};
