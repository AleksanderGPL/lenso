<template>
  <div
    class="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50"
  >
    <div class="flex flex-col h-full w-full">
      <div class="h-1/12 flex p-2 justify-end">
        <UiButton
          class="h-fit"
          icon="mdi:close"
          icon-class="text-black"
          variant="light"
          size="large"
          square
          @click="emit('close')"
        />
      </div>
      <div class="flex w-full h-10/12 justify-between">
        <div class="flex items-center justify-center p-2">
          <UiButton
            icon="mdi:chevron-left"
            icon-class="text-black"
            variant="light"
            size="large"
            square
            @click="prevImage()"
          />
        </div>
        <div class="h-full w-full flex justify-center items-center">
          <Transition :name="transition" mode="out-in">
            <img
              :key="images[currentImage].fileName"
              class="object-contain w-auto h-full shadow-2xl"
              :src="
                getS3Url(
                  `gallery/${galleryId}/${images[currentImage].fileName}`
                )
              "
              :width="images[currentImage].width"
              :height="images[currentImage].height"
            />
          </Transition>
        </div>
        <div class="flex items-center justify-center p-2">
          <UiButton
            icon="mdi:chevron-right"
            icon-class="text-black"
            variant="light"
            size="large"
            square
            @click="nextImage()"
          />
        </div>
      </div>
      <div class="h-1/12 flex flex-col p-1 justify-center items-center">
        <small :key="currentImage"
          >{{ currentImage + 1 }} / {{ images.length }}</small
        >
        <small :key="images[currentImage].fileName">{{
          images[currentImage].fileName
        }}</small>
      </div>
    </div>

    <!-- Preload previous and next image -->
    <img
      v-if="currentImage > 0"
      class="hidden"
      :src="
        getS3Url(`gallery/${galleryId}/${images[currentImage - 1].fileName}`)
      "
    />
    <img
      v-if="currentImage < images.length - 1"
      class="hidden"
      :src="
        getS3Url(`gallery/${galleryId}/${images[currentImage + 1].fileName}`)
      "
    />
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image';

const props = defineProps<{
  images: Image[];
  galleryId: number;
  currentImage: number;
}>();

const emit = defineEmits(['image:update', 'close']);
const transition = ref('');

function nextImage() {
  if (props.currentImage < props.images.length - 1) {
    transition.value = 'slide-next';
    emit('image:update', props.currentImage + 1);
  }
}

function prevImage() {
  if (props.currentImage > 0) {
    transition.value = 'slide-prev';
    emit('image:update', props.currentImage - 1);
  }
}

function handleKey(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    nextImage();
  } else if (event.key === 'ArrowLeft') {
    prevImage();
  } else if (event.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey);
});
</script>

<style scoped>
.slide-next-enter-active,
.slide-next-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-next-enter-from {
  transform: translateX(20px);
  filter: blur(2px);
  opacity: 0;
}
.slide-next-leave-to {
  transform: translateX(-20px);
  filter: blur(2px);
  opacity: 0;
}

.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.2s ease-in-out;
}

.slide-prev-enter-from {
  transform: translateX(-20px);
  filter: blur(2px);
  opacity: 0;
}
.slide-prev-leave-to {
  transform: translateX(20px);
  filter: blur(2px);
  opacity: 0;
}
</style>
