<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/50 z-50">
    <div class="flex items-center justify-center h-full w-full">
      <div class="h-[90%] w-[90%] flex justify-center items-center">
        <img
          class="object-contain w-auto h-full shadow-2xl"
          :src="
            getS3Url(`gallery/${galleryId}/${images[currentImage].fileName}`)
          "
          :width="images[currentImage].width"
          :height="images[currentImage].height"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image';

defineProps<{ images: Image[]; galleryId: number; currentImage: number }>();
</script>
