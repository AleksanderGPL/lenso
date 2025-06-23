<template>
  <UiModal card-class="w-md" title="Add gallery" @close="emit('close')">
    <form class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <UiLabel for="name">Name</UiLabel>
        <UiInput id="name" v-model="formData.name" placeholder="Name..." />
      </div>
      <div class="flex flex-col gap-1">
        <UiLabel for="description">Description</UiLabel>
        <UiTextArea
          id="description"
          v-model="formData.description"
          placeholder="Description..."
        />
      </div>
      <p v-if="error" class="text-red-500 text-sm mt-2 text-center">
        {{ error }}
      </p>
    </form>
    <template #footer>
      <UiButton size="small" icon="mdi:plus" @click="handleSubmit"
        >Create</UiButton
      >
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { createOrModifyGallerySchema } from '@/schema/services/gallery';

const api = useApi();
const emit = defineEmits(['close']);
const error = ref('');

const formData = ref({
  name: '',
  description: ''
});

async function handleSubmit() {
  const validation = validate(createOrModifyGallerySchema, formData.value);

  if (validation) {
    error.value = validation;
    return;
  }

  await api.post('/gallery', formData.value);
}
</script>
