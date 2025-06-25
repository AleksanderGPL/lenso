<template>
  <div v-if="data">
    <div class="relative">
      <img
        v-if="data.gallery.images.length > 0"
        class="w-full h-screen object-cover"
        :src="
          getS3Url(
            `gallery/${data?.gallery.id}/${data?.gallery.images[0].fileName}`
          )
        "
      />
      <div
        class="absolute bottom-2 left-2 mr-2 bg-black/50 sm:px-6 sm:py-3 px-4 py-2 rounded-xl backdrop-blur-lg"
      >
        <h1 class="sm:text-6xl text-4xl font-semibold break-words">
          {{ data.gallery.name }}
        </h1>
      </div>
    </div>
    <masonry-wall
      v-if="data?.gallery.images.length > 0"
      class="mt-0.5"
      :items="data.gallery.images"
      :ssr-columns="1"
      :column-width="400"
      :gap="2"
    >
      <template #default="{ item }">
        <GalleryImage
          :image="item"
          :gallery-id="data.gallery.id"
          :can-download="data.canDownload"
          @image:click="
            currentImage = data.gallery.images.indexOf(item);
            isLightBoxOpen = true;
          "
        />
      </template>
    </masonry-wall>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <GalleryLightBox
          v-if="isLightBoxOpen"
          :images="data.gallery.images"
          :gallery-id="data.gallery.id"
          :current-image="currentImage"
          @image:update="currentImage = $event"
          @close="isLightBoxOpen = false"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Gallery } from '~/types/gallery';
import type { Image } from '~/types/image';

const { accessKey } = useRoute().params;
const isLightBoxOpen = ref(false);
const isLoadingMore = ref(false);
const allImagesLoaded = ref(false);
const PAGE_SIZE = 50;
const currentImage = ref(0);

const api = useApi();

interface ApiResponse {
  canDownload: boolean;
  gallery: Gallery;
}

const { data } = useAsyncData(`gallery-access-${accessKey}`, async () => {
  const response = await api.get<ApiResponse>(`/gallery/access/${accessKey}`);
  return response.data;
});

async function loadMore() {
  if (!data.value) {
    return;
  }

  isLoadingMore.value = true;

  try {
    const response = await api.get<Image[]>(
      `/gallery/access/${accessKey}/images`,
      {
        params: {
          offset: data.value.gallery.images.length,
          limit: PAGE_SIZE
        }
      }
    );

    data.value.gallery.images = [
      ...data.value.gallery.images,
      ...response.data
    ];

    if (response.data.length < PAGE_SIZE) {
      allImagesLoaded.value = true;
    }
  } finally {
    isLoadingMore.value = false;
  }
}

function handleScroll() {
  if (data.value && !isLoadingMore.value && !allImagesLoaded.value) {
    const distanceToBottom =
      document.documentElement.scrollHeight -
      (window.scrollY + window.innerHeight);
    if (distanceToBottom < window.innerHeight) {
      loadMore();
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
