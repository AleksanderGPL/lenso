import type { Image } from './image';

export interface Gallery {
  id: number;
  name: string;
  description: string;
  images: Image[];
}
