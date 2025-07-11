import type { Collection } from './collection';
import type { Image } from './image';

export interface Gallery {
  id: number;
  uuid: string;
  name: string;
  description: string;
  images: Image[];
  collections: Collection[];
}
