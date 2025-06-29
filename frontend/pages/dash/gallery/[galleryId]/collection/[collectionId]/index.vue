<template>
  <div class="flex flex-col gap-2">
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
    <div v-if="collection?.accessKeys && !pending">
      <div class="flex flex-col gap-2">
        <UiCard
          v-for="accessKey in collection.accessKeys"
          :key="accessKey.id"
          class="hover:bg-neutral-700 transition-colors cursor-pointer"
          :as="NuxtLink"
          :to="`/dash/gallery/${galleryId}/collection/${collectionId}/access/${accessKey.id}`"
        >
          <div class="flex items-center justify-between">
            <div class="flex gap-2 items-center">
              <div
                :class="
                  accessKey.imageCount === '0'
                    ? 'bg-neutral-700'
                    : 'bg-yellow-400'
                "
                class="w-3 h-3 rounded-full"
              ></div>
              <p>{{ accessKey.name }}</p>
            </div>
            <p class="text-xs text-neutral-500">
              {{ accessKey.imageCount }}
              {{ accessKey.imageCount === '1' ? 'image' : 'images' }}
            </p>
          </div>
        </UiCard>
        <p
          v-if="collection.accessKeys?.length === 0"
          class="text-center text-neutral-500"
        >
          No access keys found
        </p>
      </div>
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
import { NuxtLink } from '#components';
import type { Collection } from '~/types/collection';

definePageMeta({
  layout: 'dashboard',
  sidebar: 'gallery',
  middleware: 'auth'
});

const { collectionId, galleryId } = useRoute().params;
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const isCopyNamesModalOpen = ref(false);
const api = useApi();

const { data: collection, pending } = useAsyncData<
  Collection & {
    accessKeys?: { id: number; name: string; imageCount: string }[];
  }
>(`gallery-${collectionId}-collection`, async () => {
  return (await api.get(`/collection/${collectionId}`)).data;
});

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
