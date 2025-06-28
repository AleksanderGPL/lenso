export interface Collection {
  id: number;
  galleryId: number;
  name: string;
  isShared: boolean;
  createdAt: string;
  images: {
    image: {
      id: number;
      fileName: string;
      width: number;
      height: number;
    };
  }[];
}
