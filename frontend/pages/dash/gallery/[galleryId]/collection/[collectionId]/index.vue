<template>
  <div>
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold flex items-center justify-center gap-2">
        <span
          class="flex"
          :class="collection?.isShared ? 'text-sky-400' : 'text-orange-400'"
        >
          <Icon
            :name="
              collection?.isShared ? 'ic:baseline-groups' : 'ic:baseline-lock'
            "
            size="1.25rem"
          />
        </span>
        {{ collection?.name }}
      </h2>
      <UiButton @click="isDeleteModalOpen = true">Delete</UiButton>
    </div>
    <TransitionGroup name="fade">
      <masonry-wall
        v-if="
          collection?.isShared && collection?.sharedCollectionImages.length > 0
        "
        class="mt-0.5"
        :items="collection?.sharedCollectionImages"
        :ssr-columns="1"
        :column-width="300"
        :gap="10"
      >
        <template #default="{ item }">
          <img
            :key="item.image.id"
            :src="
              getS3Url(`gallery/${collection.galleryId}/${item.image.fileName}`)
            "
            :width="item.image.width"
            :height="item.image.height"
            loading="lazy"
          />
        </template>
      </masonry-wall>
    </TransitionGroup>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalConfirm
          v-if="isDeleteModalOpen"
          hide-header
          hide-footer
          :is-loading="isDeleting"
          @confirm="deleteCollection"
          @cancel="isDeleteModalOpen = false"
        >
          <p>Are you sure you want to delete this collection?</p>
        </ModalConfirm>
      </Transition>
    </Teleport>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalCopyNames
          v-if="isCopyNamesModalOpen"
          :names="
            collection?.sharedCollectionImages.map(
              (image) => image.image.fileName
            ) ?? []
          "
          @close="isCopyNamesModalOpen = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const { collectionId } = useRoute().params;
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const isCopyNamesModalOpen = ref(false);
const api = useApi();

const { data: collection } = useAsyncData<Collection>(
  `gallery-${collectionId}-collection`,
  async () => {
    return (await api.get(`/collection/${collectionId}`)).data;
  }
);

async function deleteCollection() {
  try {
    isDeleting.value = true;
    await api.delete(`/collection/${collectionId}`);
    navigateTo(`/dash/gallery/${collection.value?.galleryId}/collections`);
  } finally {
    isDeleting.value = false;
  }
}
</script>
