import type { Image } from './image';

export interface Gallery {
  id: string;
  name: string;
  description: string;
  images: Image[];
}
