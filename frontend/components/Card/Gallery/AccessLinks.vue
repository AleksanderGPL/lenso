<template>
  <UiCard>
    <h3 class="text-lg font-semibold">Links</h3>
    {{ accessKeys }}
    <UiButton icon="mdi:plus">New</UiButton>
  </UiCard>
</template>

<script setup lang="ts">
const props = defineProps<{ galleryId: number }>();

const api = useApi();

const { data: accessKeys } = useAsyncData(
  `gallery-${props.galleryId}-accessKeys`,
  async () => {
    return (await api.get(`/gallery/${props.galleryId}/accessKeys`)).data;
  }
);
</script>
