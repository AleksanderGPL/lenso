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
        <GalleryImage
          :image="item"
          :gallery-id="data.gallery.id"
          :can-download="data.canDownload"
          @image:click="
            currentImage = data.gallery.images.indexOf(item);
            isLightBoxOpen = true;
          "
        />
      </template>
    </masonry-wall>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <GalleryLightBox
          v-if="isLightBoxOpen"
          :images="data.gallery.images"
          :gallery-id="data.gallery.id"
          :current-image="currentImage"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '~/types/gallery';

const { accessKey } = useRoute().params;
const isLightBoxOpen = ref(false);
const currentImage = ref(0);

const api = useApi();
const { data } = useAsyncData<{ canDownload: boolean; gallery: Gallery }>(
  `gallery-access-${accessKey}`,
  async () => {
    const response = await api.get(`/gallery/access/${accessKey}`);
    return response.data;
  }
);
</script>
