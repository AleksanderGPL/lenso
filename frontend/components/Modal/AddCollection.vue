<template>
  <UiModal card-class="w-md" title="Add collection" @close="emit('close')">
    <form class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <UiLabel for="name">Name</UiLabel>
        <UiInput id="name" v-model="formData.name" placeholder="Name..." />
      </div>
      <div class="flex items-center gap-2 self-center">
        <div
          class="flex items-center gap-1 transition-colors"
          :class="formData.isShared ? 'text-neutral-400' : 'text-orange-400'"
        >
          <Icon name="ic:baseline-lock" />
          <span class="font-medium text-sm">Private</span>
        </div>
        <UiToggle
          id="sharedPublic"
          :model-value="formData.isShared"
          :disabled="isLoading"
          @update:model-value="
            sharedPublicTransition = formData.isShared
              ? 'slide-left-blur'
              : 'slide-right-blur';
            formData.isShared = $event;
          "
        />
        <div
          class="flex items-center gap-1 transition-colors"
          :class="formData.isShared ? 'text-sky-400' : 'text-neutral-400'"
        >
          <span class="font-medium text-sm">Shared</span>
          <Icon name="ic:baseline-groups" />
        </div>
      </div>
      <div class="text-center text-xs text-neutral-500">
        <Transition :name="sharedPublicTransition" mode="out-in">
          <p v-if="formData.isShared">
            One shared collection for all clients. Ideal for teams curating a
            single set of images together.
          </p>
          <p v-else>
            One collection per client. Ideal for groups of clients selecting
            their favorites from the same pool of images.
          </p>
        </Transition>
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
import { createCollectionSchema } from '@/schema/services/gallery';

const props = defineProps<{ galleryId: number }>();

const api = useApi();
const emit = defineEmits(['close', 'add']);
const error = ref('');
const isLoading = ref(false);
const sharedPublicTransition = ref('');

const formData = ref({
  name: '',
  isShared: false
});

async function handleSubmit() {
  isLoading.value = true;
  try {
    const validation = validate(createCollectionSchema, formData.value);

    if (validation) {
      error.value = validation;
      throw new Error(validation);
    }

    const response = await api.post(
      `/gallery/${props.galleryId}/collection`,
      formData.value
    );

    emit('add', response.data);
    emit('close');
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.slide-left-blur-enter-active,
.slide-left-blur-leave-active {
  transition: all 0.1s ease-in-out;
}

.slide-left-blur-enter-from {
  transform: translateX(-10px);
  filter: blur(2px);
  opacity: 0;
}

.slide-left-blur-leave-to {
  transform: translateX(10px);
  filter: blur(0);
  opacity: 0;
}

.slide-right-blur-enter-active,
.slide-right-blur-leave-active {
  transition: all 0.1s ease-in-out;
}

.slide-right-blur-enter-from {
  transform: translateX(10px);
  filter: blur(2px);
  opacity: 0;
}

.slide-right-blur-leave-to {
  transform: translateX(-10px);
  filter: blur(0);
  opacity: 0;
}
</style>
