<template>
  <UiCard
    :as="NuxtLink"
    :to="`/dash/gallery/${gallery.id}`"
    class="hover:bg-neutral-700 transition-colors"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">{{ gallery.name }}</h2>
      <p class="text-sm text-neutral-400">{{ gallery.description }}</p>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';
import type { Gallery } from '@/types/gallery';
defineProps<{ gallery: Gallery }>();
</script>
