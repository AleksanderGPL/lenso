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
      <div class="absolute bottom-2 left-2">
        <h1 class="text-2xl font-semibold">{{ data.gallery.name }}</h1>
      </div>
    </div>
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
