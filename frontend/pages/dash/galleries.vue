<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center w-full mb-2">
      <h2 class="text-xl font-semibold">Galleries</h2>
      <UiButton
        icon="mdi:plus"
        variant="outline"
        size="small"
        @click="isOpen = true"
        >Add gallery</UiButton
      >
    </div>
    <div v-if="galleries" class="flex flex-col gap-2">
      <CardGallery
        v-for="gallery in galleries"
        :key="gallery.id"
        :gallery="gallery.gallery"
      />
    </div>
    <UiSkeletonLoader v-else class="w-full grow" :loader-size="6" />
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalAddGallery v-if="isOpen" @close="isOpen = false" />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '@/types/gallery';

const isOpen = ref(false);

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const api = useApi();
const { data: galleries } = useAsyncData('galleries', async () => {
  return (await api.get<{ id: string; gallery: Gallery }[]>('/gallery')).data;
});
</script>
