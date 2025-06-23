<template>
  <div class="flex h-full flex-col gap-2">
    <h2 class="text-xl font-semibold">Images</h2>
    <CardFileUpload :is-uploading="isUploading" @update:files="uploadImages" />
    <TransitionGroup name="fade">
      <masonry-wall
        v-if="images && images.length > 0"
        class="mt-0.5"
        :items="images"
        :ssr-columns="1"
        :column-width="500"
        :gap="10"
      >
        <template #default="{ item }">
          <CardImage
            :key="item.id"
            :image="item"
            :gallery-id="galleryId as string"
            @delete="deleteImage(item)"
          />
        </template>
      </masonry-wall>
    </TransitionGroup>
    <UiSkeletonLoader v-if="pending" class="w-full grow" :loader-size="6" />
  </div>
</template>

<script setup lang="ts">
import type { Image } from '@/types/image';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});

const api = useApi();
const isUploading = ref(false);
const { galleryId } = useRoute().params;

const { data: images, pending } = useAsyncData<Image[]>(
  `gallery-${galleryId}-images`,
  async () => {
    return (await api.get(`/gallery/${galleryId}/images`)).data;
  }
);

async function uploadImages(files: File[]) {
  try {
    isUploading.value = true;

    const response = await api.postForm(`/gallery/${galleryId}/images`, {
      images: files
    });

    images.value?.push(...response.data);
  } finally {
    isUploading.value = false;
  }
}

function deleteImage(image: Image) {
  images.value = images.value?.filter((img) => img.id !== image.id) || [];
}
</script>
