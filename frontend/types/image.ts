export interface Image {
  id: number;
  galleryId: number;
  fileName: string;
  height: number;
  width: number;
  sharedCollections: {
    collectionId: number;
  }[];
  privateCollections: {
    collectionId: number;
  }[];
}
