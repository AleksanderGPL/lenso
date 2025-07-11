<template>
  <div class="flex h-full flex-col">
    <CardFileUpload
      :is-uploading="isUploading"
      :can-compress="true"
      :compress="compress"
      @update:compress="compress = $event"
      @update:files="uploadImages"
    />
    <TransitionGroup name="fade">
      <masonry-wall
        v-if="data && data.images.length > 0"
        class="mt-2"
        :items="data.images"
        :ssr-columns="1"
        :column-width="300"
        :gap="10"
      >
        <template #default="{ item }">
          <CardImage
            :key="item.id"
            :image="item"
            :gallery-id="galleryId as string"
            :gallery-uuid="data.uuid"
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
  sidebar: 'gallery',
  middleware: 'auth',
  title: 'Images'
});

const api = useApi();
const isUploading = ref(false);
const compress = ref(true);
const { galleryId } = useRoute().params;

const { data, pending } = useAsyncData<{ images: Image[]; uuid: string }>(
  `gallery-${galleryId}-images`,
  async () => {
    return (await api.get(`/gallery/${galleryId}/images`)).data;
  }
);

async function uploadImages(files: File[]) {
  try {
    isUploading.value = true;

    const response = await api.postForm(`/gallery/${galleryId}/images`, {
      images: files,
      compress: compress.value
    });

    data.value = {
      images: [...(data.value?.images || []), ...response.data],
      uuid: data.value?.uuid || ''
    };
  } finally {
    isUploading.value = false;
  }
}

function deleteImage(image: Image) {
  data.value = {
    images: data.value?.images.filter((img) => img.id !== image.id) || [],
    uuid: data.value?.uuid || ''
  };
}
</script>
