<template>
  <div>
    <div class="flex justify-between items-center w-full">
      <h2 class="text-xl font-semibold">Galleries</h2>
      <UiButton icon="mdi:plus" variant="outline" @click="isOpen = true"
        >Add gallery</UiButton
      >
    </div>
    <div class="flex flex-col gap-2">
      <CardGallery
        v-for="gallery in galleries"
        :key="gallery.id"
        :gallery="gallery.gallery"
      />
    </div>
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
  layout: 'dashboard'
});

const api = useApi();
const { data: galleries } = useAsyncData('galleries', async () => {
  return (await api.get<{ id: string; gallery: Gallery }[]>('/gallery')).data;
});
</script>
