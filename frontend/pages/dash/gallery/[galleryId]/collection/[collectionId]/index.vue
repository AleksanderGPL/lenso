<template>
  <div>Collection {{ collection }}</div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const { collectionId } = useRoute().params;
const api = useApi();

const { data: collection } = useAsyncData<Collection>(
  `gallery-${collectionId}-collection`,
  async () => {
    return (await api.get(`/collection/${collectionId}`)).data;
  }
);
</script>
