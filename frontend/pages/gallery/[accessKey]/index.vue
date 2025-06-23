<template>
  <div>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '~/types/gallery';

const { accessKey } = useRoute().params;

const api = useApi();
const { data } = useAsyncData<{ canDownload: boolean; gallery: Gallery }>(
  `gallery-access-${accessKey}`,
  async () => {
    const response = await api.get(`/gallery/access/${accessKey}`);
    return response.data;
  }
);
</script>
