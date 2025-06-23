<template>
  <div v-if="data">
    <div class="relative">
      <img
        v-if="data.gallery.images.length > 0"
        class="w-full h-screen object-cover"
        :src="
          getS3Url(
            `gallery/${data?.gallery.id}/${data?.gallery.images[0].fileName}`
          )
        "
      />
      <div
        class="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-xl backdrop-blur-lg"
      >
        <h1 class="text-6xl font-semibold">{{ data.gallery.name }}</h1>
      </div>
    </div>
    <masonry-wall
      v-if="data?.gallery.images.length > 0"
      class="mt-0.5"
      :items="data.gallery.images"
      :ssr-columns="1"
      :column-width="400"
      :gap="2"
    >
      <template #default="{ item }">
        <div class="pointer-events-none">
          <img
            :src="getS3Url(`gallery/${data?.gallery.id}/${item.fileName}`)"
            :width="item.width"
            :height="item.height"
            loading="lazy"
          />
        </div>
      </template>
    </masonry-wall>
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '~/types/gallery';

const { accessKey } = useRoute().params;

const api = useApi();
const { data } = useAsyncData<{ canDownload: boolean; gallery: Gallery }>(
  `gallery-access-${accessKey}`,
  async () => {
    const response = await api.get(`/gallery/access/${accessKey}`);
    return response.data;
  }
);
</script>
