<template>
  <div>
    <h2 class="text-xl font-semibold">Images</h2>
    <CardFileUpload @update:files="uploadImages" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});

const api = useApi();
const { galleryId } = useRoute().params;

async function uploadImages(files: File[]) {
  await api.postForm(`/gallery/${galleryId}/images`, {
    images: files
  });
}
</script>
