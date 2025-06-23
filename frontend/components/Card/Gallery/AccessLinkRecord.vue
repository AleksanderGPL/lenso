<template>
  <li class="flex items-center justify-between p-2">
    <span class="text-sm truncate">{{ record.name }}</span>
    <div class="flex gap-2">
      <UiButton
        :icon="recentlyCopied ? 'material-symbols:check' : 'mdi:link'"
        variant="outline"
        size="small"
        @click="copyLink"
      ></UiButton>
      <UiButton
        icon="mdi:delete"
        variant="danger"
        size="small"
        :loading="isDeleting"
        @click="isDeleteModalOpen = true"
      ></UiButton>
    </div>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalConfirm
          v-if="isDeleteModalOpen"
          :hide-footer="true"
          :hide-header="true"
          @cancel="isDeleteModalOpen = false"
          @confirm="deleteLink"
        >
          <p>Are you sure you want to delete this link?</p>
        </ModalConfirm>
      </Transition>
    </Teleport>
  </li>
</template>

<script setup lang="ts">
import type { AccessKey } from '@/types/access-key';

const api = useApi();
const emit = defineEmits(['delete']);
const props = defineProps<{ record: AccessKey }>();
const recentlyCopied = ref(false);
const isDeleting = ref(false);
const isDeleteModalOpen = ref(false);

function copyLink() {
  recentlyCopied.value = true;
  navigator.clipboard.writeText(
    `${new URL(window.location.href).origin}/gallery/${props.record.accessKey}`
  );
  setTimeout(() => {
    recentlyCopied.value = false;
  }, 1000);
}

async function deleteLink() {
  try {
    isDeleteModalOpen.value = false;
    isDeleting.value = true;
    await api.delete(
      `/gallery/${props.record.galleryId}/access/${props.record.accessKey}`
    );
    emit('delete');
  } finally {
    isDeleting.value = false;
  }
}
</script>
