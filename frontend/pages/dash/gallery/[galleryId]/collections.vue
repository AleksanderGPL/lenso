<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center w-full mb-2">
      <h2 class="text-xl font-semibold">Collections</h2>
      <UiButton
        icon="mdi:plus"
        variant="outline"
        size="small"
        @click="isAddCollectionModalOpen = true"
        >Add collection</UiButton
      >
    </div>
    <div v-if="collections" class="flex flex-col gap-2">
      <UiCard v-for="collection in collections" :key="collection.id">
        <p>{{ collection.name }}</p>
      </UiCard>
    </div>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalAddCollection
          v-if="isAddCollectionModalOpen"
          :gallery-id="Number(galleryId)"
          @close="isAddCollectionModalOpen = false"
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

const isAddCollectionModalOpen = ref(false);
const { galleryId } = useRoute().params;
const api = useApi();

const { data: collections } = useAsyncData<Collection[]>(
  `gallery-${galleryId}-collections`,
  async () => {
    return (await api.get(`/gallery/${galleryId}/collections`)).data;
  }
);
</script>
