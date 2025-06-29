<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold flex items-center justify-center gap-2">
        <span
          class="flex"
          :class="collection?.isShared ? 'text-sky-400' : 'text-orange-400'"
        >
          <Icon
            :name="
              collection?.isShared ? 'ic:baseline-groups' : 'ic:baseline-lock'
            "
            size="1.25rem"
          />
        </span>
        {{ collection?.accessKey?.name }}
      </h2>
      <UiButton icon="mdi:content-copy" @click="isCopyFilenamesModalOpen = true"
        >Copy Filenames</UiButton
      >
    </div>
    <TransitionGroup name="fade">
      <masonry-wall
        v-if="collection && collection.privateCollectionImages.length > 0"
        class="mt-0.5"
        :items="collection.privateCollectionImages"
        :ssr-columns="1"
        :column-width="300"
        :gap="10"
      >
        <template #default="{ item }">
          <img
            :key="item.image.id"
            :src="getS3Url(`gallery/${galleryId}/${item.image.fileName}`)"
            :alt="item.image.fileName"
            :width="item.image.width"
            :height="item.image.height"
          />
        </template>
      </masonry-wall>
    </TransitionGroup>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalCopyNames
          v-if="isCopyFilenamesModalOpen"
          :names="
            collection?.privateCollectionImages.map(
              (image) => image.image.fileName
            ) || []
          "
          @cancel="isCopyFilenamesModalOpen = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const api = useApi();
const { galleryId, collectionId, accessId } = useRoute().params;
const isCopyFilenamesModalOpen = ref(false);

const { data: collection } = useAsyncData<Collection>(
  `gallery-${galleryId}-collection-${collectionId}-access-${accessId}`,
  async () => {
    return (await api.get(`/collection/${collectionId}/access/${accessId}`))
      .data;
  }
);
</script>
