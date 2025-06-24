<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-50">
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
          <Transition name="image" mode="out-in">
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
        <small>{{ currentImage + 1 }} / {{ images.length }}</small>
        <small>{{ images[currentImage].fileName }}</small>
      </div>
    </div>
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

function nextImage() {
  if (props.currentImage < props.images.length - 1) {
    emit('image:update', props.currentImage + 1);
  }
}

function prevImage() {
  if (props.currentImage > 0) {
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
.image-enter-active,
.image-leave-active {
  transition: all 0.2s ease-in-out;
}

.image-enter-from {
  transform: translateX(20px);
  filter: blur(2px);
  opacity: 0;
}
.image-leave-to {
  transform: translateX(-20px);
  filter: blur(2px);
  opacity: 0;
}
</style>
