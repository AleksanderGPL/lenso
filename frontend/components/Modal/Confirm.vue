<template>
  <UiModal
    :hide-header="hideHeader"
    :hide-footer="hideFooter"
    card-class="sm:max-w-md w-full m-4"
    @close="emit('cancel')"
  >
    <div class="flex flex-col items-center gap-4">
      <Icon
        name="material-symbols:warning-rounded"
        size="3rem"
        class="text-orange-400"
      />
      <slot />
      <div class="flex w-full justify-end gap-2">
        <UiButton @click="emit('cancel')">Cancel</UiButton>
        <UiButton :loading="isLoading" @click="emit('confirm')"
          >Confirm</UiButton
        >
      </div>
    </div>
  </UiModal>
</template>

<script setup lang="ts">
defineProps<{
  isLoading?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}>();

const emit = defineEmits(['cancel', 'confirm']);
</script>
