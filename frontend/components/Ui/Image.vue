<template>
  <div>
    <UiSkeletonLoader
      v-if="!isLoaded"
      :style="{ width: width + 'px', height: height + 'px' }"
    />
    <img :src="src" :width="width" :height="height" @load="isLoaded = true" />
  </div>
</template>

<script setup lang="ts">
const isLoaded = ref(false);

defineProps<{
  src: string;
  width?: number;
  height?: number;
  loading?: string;
}>();
</script>
