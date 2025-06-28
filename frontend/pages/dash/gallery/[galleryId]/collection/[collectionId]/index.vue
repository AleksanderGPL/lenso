<template>
  <div>Collection {{ collectionId }}</div>
</template>

<script setup lang="ts">
const { collectionId } = useRoute().params;
definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});
</script>
