<template>
  <UiCard
    class="border-dashed flex flex-col items-center justify-center"
    @drop.prevent="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
  >
    <input
      ref="fileInput"
      class="hidden"
      type="file"
      multiple
      accept="image/*"
      @change="handleFileChange"
    />
    <div
      class="flex flex-col items-center justify-center mb-2 text-neutral-400"
    >
      <Icon name="mdi:upload" size="2rem" />
      <p>Drop files here</p>
      <p class="text-sm">or</p>
    </div>
    <UiButton icon="mdi:upload" variant="outline" @click="fileInput?.click()"
      >Choose from device</UiButton
    >
  </UiCard>
</template>

<script setup lang="ts">
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false); // TODO: Add animation
const emit = defineEmits(['update:files']);

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:files', target.files);
}

function handleDrop(event: DragEvent) {
  emit('update:files', event.dataTransfer?.files);
}

function handleDragOver(event: DragEvent) {
  isDragging.value = true;
}

function handleDragLeave(event: DragEvent) {
  isDragging.value = false;
}
</script>
