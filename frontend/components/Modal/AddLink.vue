<template>
  <UiModal card-class="w-md" title="Add link" @close="emit('close')">
    <form class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <UiLabel for="name">Name</UiLabel>
        <UiInput id="name" v-model="formData.name" placeholder="Name..." />
      </div>
      <div class="flex gap-1">
        <UiLabel for="canDownload">Download</UiLabel>
        <UiToggle id="canDownload" v-model="formData.canDownload" />
      </div>
      <div class="flex gap-1">
        <UiLabel for="canUseCollections">Collections</UiLabel>
        <UiToggle id="canUseCollections" v-model="formData.canUseCollections" />
      </div>
      <p v-if="error" class="text-red-500 text-sm mt-2 text-center">
        {{ error }}
      </p>
    </form>
    <template #footer>
      <UiButton
        size="small"
        icon="mdi:plus"
        :loading="isLoading"
        @click="handleSubmit"
        >Create</UiButton
      >
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { createAccessKeySchema } from '@/schema/services/gallery';

const props = defineProps<{ galleryId: number }>();

const api = useApi();
const emit = defineEmits(['close', 'add']);
const error = ref('');
const isLoading = ref(false);

const formData = ref({
  name: '',
  canDownload: false,
  canUseCollections: false
});

async function handleSubmit() {
  isLoading.value = true;
  try {
    const validation = validate(createAccessKeySchema, formData.value);

    if (validation) {
      error.value = validation;
      throw new Error(validation);
    }

    const response = await api.post(
      `/gallery/${props.galleryId}/accessKey`,
      formData.value
    );
    emit('add', response.data);
    emit('close');
  } finally {
    isLoading.value = false;
  }
}
</script>
