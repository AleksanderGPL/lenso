<template>
  <div
    class="fixed top-0 w-full h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-100"
  >
    <UiCard :class="cardClass">
      <div class="flex justify-between items-center pb-4">
        <span class="font-semibold text-xl">{{ title }}</span>
        <UiButton
          icon="mdi:close"
          variant="outline"
          size="small"
          @click="emit('close')"
        ></UiButton>
      </div>
      <hr class="h-1 text-neutral-800 -mx-4" />
      <slot />
      <hr class="h-1 text-neutral-800 -mx-4" />
      <div class="flex justify-end items-center pt-2">
        <slot name="footer" />
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  cardClass?: string;
}>();

const emit = defineEmits(['close']);
</script>
