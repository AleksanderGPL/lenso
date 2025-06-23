<template>
  <UiCard>
    <h3 class="text-lg font-semibold">Links</h3>
    <ul class="divide-y divide-neutral-800 max-h-full overflow-y-auto">
      <CardGalleryAccessLinkRecord
        v-for="accessKey in accessKeys"
        :key="accessKey.id"
        :record="accessKey"
        @delete="deleteLink(accessKey)"
      />
    </ul>
    <UiButton icon="mdi:plus" @click="showModal = true">New</UiButton>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalAddLink
          v-if="showModal"
          :gallery-id="props.galleryId"
          @close="showModal = false"
          @add="accessKeys?.push($event)"
        />
      </Transition>
    </Teleport>
  </UiCard>
</template>

<script setup lang="ts">
import type { AccessKey } from '@/types/access-key';

const props = defineProps<{ galleryId: number }>();

const api = useApi();
const showModal = ref(false);

const { data: accessKeys } = useAsyncData<AccessKey[]>(
  `gallery-${props.galleryId}-accessKeys`,
  async () => {
    return (await api.get(`/gallery/${props.galleryId}/accessKeys`)).data;
  }
);

function deleteLink(accessKey: AccessKey) {
  if (accessKeys.value) {
    accessKeys.value = accessKeys.value.filter(
      (key) => key.id !== accessKey.id
    );
  }
}
</script>
