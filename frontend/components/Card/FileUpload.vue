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

function updateFiles(files: FileList) {
  emit('update:files', Array.from(files));
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files) return;
  updateFiles(target.files);
}

function handleDrop(event: DragEvent) {
  if (!event.dataTransfer?.files) return;
  updateFiles(event.dataTransfer.files);
}

function handleDragOver() {
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}
</script>
