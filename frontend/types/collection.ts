export interface Collection {
  id: number;
  galleryId: number;
  name: string;
  isShared: boolean;
  createdAt: string;
  sharedCollectionImages: {
    image: {
      id: number;
      fileName: string;
      width: number;
      height: number;
    };
  }[];
  privateCollectionImages: {
    image: {
      id: number;
      fileName: string;
      width: number;
      height: number;
    };
  }[];
}
