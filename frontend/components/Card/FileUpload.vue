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
      <Icon v-if="!isUploading" name="mdi:upload" size="2rem" />
      <UiLoader v-else />
      <p v-if="isUploading" class="text-sm mt-2">Uploading...</p>
      <p v-if="!isUploading">Drop files here</p>
      <p v-if="!isUploading" class="text-sm">or</p>
    </div>
    <UiButton
      v-if="!isUploading"
      icon="mdi:upload"
      variant="outline"
      @click="fileInput?.click()"
      >Choose from device</UiButton
    >
    <div
      v-if="canCompress && compress !== undefined && !isUploading"
      class="flex items-center gap-2 mt-2"
    >
      Compress
      <UiToggle
        :model-value="compress"
        @update:model-value="emit('update:compress', $event)"
      />
    </div>
  </UiCard>
</template>

<script setup lang="ts">
defineProps<{
  isUploading?: boolean;
  canCompress?: boolean;
  compress?: boolean;
}>();
const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false); // TODO: Add animation
const emit = defineEmits(['update:files', 'update:compress']);

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
