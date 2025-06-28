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
          :access-key="accessKey as string"
          :gallery-id="data.gallery.id"
          :collections="data.gallery.collections"
          :can-download="data.canDownload"
          :can-use-collections="data.canUseCollections"
          @image:click="
            currentImage = data.gallery.images.indexOf(item);
            isLightBoxOpen = true;
          "
          @collection:add="item.collections.push({ collectionId: $event })"
          @collection:remove="
            item.collections = item.collections.filter(
              (c) => c.collectionId !== $event
            )
          "
        />
      </template>
    </masonry-wall>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <GalleryLightBox
          v-if="isLightBoxOpen"
          :images="data.gallery.images"
          :collections="data.gallery.collections"
          :gallery-id="data.gallery.id"
          :current-image="currentImage"
          @image:update="currentImage = $event"
          @close="isLightBoxOpen = false"
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
const { data } = useAsyncData<{
  canDownload: boolean;
  canUseCollections: boolean;
  gallery: Gallery;
}>(`gallery-access-${accessKey}`, async () => {
  const response = await api.get(`/gallery/access/${accessKey}`);
  return response.data;
});
</script>
