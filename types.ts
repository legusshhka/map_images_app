export interface ImageData {
  id: string;
  uri: string;
}

export interface MarkerData {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title: string;
  images: ImageData[];
}

export type MarkerDetailsParams = {
  id: string;
};
