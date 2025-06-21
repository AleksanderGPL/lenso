<template>
  <div>
    <h2 class="text-xl font-semibold">General</h2>
    <form
      v-if="gallery"
      class="flex flex-col gap-2"
      @submit.prevent="updateGallery"
    >
      <div class="flex flex-col gap-1">
        <UiLabel>Name</UiLabel>
        <UiInput v-model="gallery.name" />
      </div>
      <div class="flex flex-col gap-1">
        <UiLabel>Description</UiLabel>
        <UiInput v-model="gallery.description" />
      </div>
      <UiButton icon="mdi:content-save-outline" :loading="isSaving"
        >Save</UiButton
      >
    </form>
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
const { data: gallery } = useAsyncData<Gallery>(
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
