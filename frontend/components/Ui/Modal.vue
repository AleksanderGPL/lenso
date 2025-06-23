<template>
  <div
    class="fixed top-0 w-full h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-100"
  >
    <UiCard :class="cardClass">
      <div class="flex justify-between items-center pb-4">
        <span v-if="!hideHeader" class="font-semibold text-xl">{{
          title
        }}</span>
        <UiButton
          v-if="!hideHeader"
          icon="mdi:close"
          variant="outline"
          size="small"
          @click="emit('close')"
        ></UiButton>
      </div>
      <hr v-if="!hideHeader" class="text-neutral-800 -mx-4" />
      <div :class="{ 'my-4': !hideHeader }">
        <slot />
      </div>
      <hr v-if="!hideFooter" class="text-neutral-800 -mx-4" />
      <div v-if="!hideFooter" class="flex justify-end items-center pt-4">
        <slot name="footer" />
      </div>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  cardClass?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
}>();

const emit = defineEmits(['close']);
</script>
