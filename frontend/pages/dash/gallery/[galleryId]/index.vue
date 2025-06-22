<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-xl font-semibold">General</h2>
    <div class="grid grid-cols-2 gap-4">
      <UiCard
        as="form"
        class="flex flex-col gap-2"
        @submit.prevent="updateGallery"
      >
        <div class="flex flex-col gap-1">
          <UiLabel>Name</UiLabel>
          <UiInput v-if="!pending && gallery" v-model="gallery.name" />
          <UiSkeleton v-else class="w-full h-10" />
        </div>
        <div class="flex flex-col gap-1">
          <UiLabel>Description</UiLabel>
          <UiInput v-if="!pending && gallery" v-model="gallery.description" />
          <UiSkeleton v-else class="w-full h-10" />
        </div>
        <UiButton icon="mdi:content-save-outline" :loading="isSaving"
          >Save</UiButton
        >
      </UiCard>
      <CardGalleryAccessLinks :gallery-id="Number(galleryId)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '~/types/gallery';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});

const api = useApi();
const isSaving = ref(false);
const { galleryId } = useRoute().params;
const { data: gallery, pending } = useAsyncData<Gallery>(
  `gallery-${galleryId}`,
  async () => {
    return (await api.get(`/gallery/${galleryId}`)).data;
  }
);

async function updateGallery() {
  try {
    isSaving.value = true;
    await api.put(`/gallery/${galleryId}`, {
      name: gallery.value?.name,
      description: gallery.value?.description
    });
  } finally {
    isSaving.value = false;
  }
}
</script>
