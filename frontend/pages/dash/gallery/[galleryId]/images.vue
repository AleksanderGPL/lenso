<template>
  <div>
    <h2 class="text-xl font-semibold">Images</h2>
    <CardFileUpload />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery'
});
</script>
