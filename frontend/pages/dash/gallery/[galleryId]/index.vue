<template>
  <div>
    <h2 class="text-xl font-semibold">General</h2>
    {{ gallery }}
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});

const { galleryId } = useRoute().params;

const api = useApi();
const { data: gallery } = useAsyncData(`gallery-${galleryId}`, async () => {
  return (await api.get(`/gallery/${galleryId}`)).data;
});
</script>
