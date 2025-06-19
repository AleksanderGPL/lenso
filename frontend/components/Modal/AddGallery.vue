<template>
  <UiModal card-class="w-md" title="Add gallery" @close="emit('close')">
    <form class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <UiLabel for="name">Name</UiLabel>
        <UiInput v-model="formData.name" id="name" placeholder="Name..." />
      </div>
      <div class="flex flex-col gap-1">
        <UiLabel for="description">Description</UiLabel>
        <UiTextArea
          v-model="formData.description"
          id="description"
          placeholder="Description..."
        />
      </div>
      <p v-if="error" class="text-red-500 text-sm mt-2 text-center">
        {{ error }}
      </p>
    </form>
    <template #footer>
      <UiButton @click="handleSubmit" size="small" icon="mdi:plus"
        >Create</UiButton
      >
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { createGallerySchema } from '@/schema/services/gallery';

const api = useApi();
const emit = defineEmits(['close']);
const error = ref('');

const formData = ref({
  name: '',
  description: ''
});

async function handleSubmit() {
  const validation = validate(createGallerySchema, formData.value);

  if (validation) {
    error.value = validation;
  }

  await api.post('/gallery', formData.value);
}
</script>
