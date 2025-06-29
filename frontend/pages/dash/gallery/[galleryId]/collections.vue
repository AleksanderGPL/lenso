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
    <div v-if="!pending" class="flex flex-col gap-2">
      <UiCard
        v-for="collection in collections"
        :key="collection.id"
        class="hover:bg-neutral-700 transition-colors cursor-pointer"
        :as="NuxtLink"
        :to="`/dash/gallery/${galleryId}/collection/${collection.id}`"
      >
        <div class="flex items-center justify-between">
          <div class="flex gap-2 items-center">
            <Icon
              :name="
                collection.isShared ? 'ic:baseline-groups' : 'ic:baseline-lock'
              "
              :class="collection.isShared ? 'text-sky-400' : 'text-orange-400'"
              size="1.25rem"
            />
            <p>{{ collection.name }}</p>
          </div>
          <p class="text-xs text-neutral-500">
            {{ formatTime(new Date(collection.createdAt)) }}
          </p>
        </div>
      </UiCard>
      <p v-if="collections?.length === 0" class="text-center text-neutral-500">
        No collections found
      </p>
    </div>
    <UiSkeletonLoader v-else class="h-full" />
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
import { NuxtLink } from '#components';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const isAddCollectionModalOpen = ref(false);
const { galleryId } = useRoute().params;
const api = useApi();

const { data: collections, pending } = useAsyncData<Collection[]>(
  `gallery-${galleryId}-collections`,
  async () => {
    return (await api.get(`/gallery/${galleryId}/collections`)).data;
  }
);
</script>
