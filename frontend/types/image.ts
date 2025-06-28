export interface Image {
  id: number;
  galleryId: number;
  fileName: string;
  height: number;
  width: number;
  collections: {
    collectionId: number;
  }[];
}
