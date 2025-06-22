<template>
  <div class="flex h-full flex-col gap-2">
    <h2 class="text-xl font-semibold">Images</h2>
    <CardFileUpload @update:files="uploadImages" />
    <div class="grid grid-cols-4 gap-2">
      <CardImage
        v-for="image in images"
        :key="image.id"
        :image="image"
        :galleryId="galleryId as string"
      />
    </div>
    <UiSkeletonLoader v-if="pending" class="w-full grow" :loaderSize="6" />
  </div>
</template>

<script setup lang="ts">
import type { Image } from '@/types/image';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});

const api = useApi();
const { galleryId } = useRoute().params;

const { data: images, pending } = useAsyncData<Image[]>(
  `gallery-${galleryId}-images`,
  async () => {
    return (await api.get(`/gallery/${galleryId}/images`)).data;
  }
);

async function uploadImages(files: File[]) {
  await api.postForm(`/gallery/${galleryId}/images`, {
    images: files
  });
}
</script>
