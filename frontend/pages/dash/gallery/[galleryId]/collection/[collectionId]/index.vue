<template>
  <div>
    <h2 class="text-xl font-semibold">{{ collection?.name }}</h2>
    <TransitionGroup name="fade">
      <masonry-wall
        v-if="collection?.images && collection.images.length > 0"
        class="mt-0.5"
        :items="collection.images"
        :ssr-columns="1"
        :column-width="300"
        :gap="10"
      >
        <template #default="{ item }">
          <img
            :key="item.image.id"
            :src="
              getS3Url(`gallery/${collection.galleryId}/${item.image.fileName}`)
            "
            :width="item.image.width"
            :height="item.image.height"
            loading="lazy"
          />
        </template>
      </masonry-wall>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const { collectionId } = useRoute().params;
const api = useApi();

const { data: collection } = useAsyncData<Collection>(
  `gallery-${collectionId}-collection`,
  async () => {
    return (await api.get(`/collection/${collectionId}`)).data;
  }
);
</script>
