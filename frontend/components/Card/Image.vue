<template>
  <div
    :key="image.id"
    class="relative border border-neutral-700 rounded-lg overflow-hidden h-fit"
  >
    <div class="absolute top-2 right-2">
      <UiButton
        icon="mdi:delete"
        variant="danger"
        :loading="isDeleting"
        square
        @click="deleteImage()"
      />
    </div>
    <img
      :src="getS3Url(`gallery/${galleryUuid}/${image.fileName}`)"
      :width="image.width"
      :height="image.height"
      loading="lazy"
      class="object-cover"
    />
  </div>
</template>

<script setup lang="ts">
import type { Image } from '@/types/image';

const api = useApi();
const isDeleting = ref(false);
const emit = defineEmits(['delete']);

const props = defineProps<{
  image: Image;
  galleryUuid: string;
  galleryId: string;
}>();

async function deleteImage() {
  try {
    isDeleting.value = true;
    await api.delete(`/gallery/${props.galleryId}/images/${props.image.id}`);
    emit('delete');
  } finally {
    isDeleting.value = false;
  }
}
</script>
