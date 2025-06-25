<template>
  <div class="relative group">
    <div class="absolute top-2 right-2 flex gap-2 z-10">
      <TransitionGroup name="icons">
        <template v-if="isOpen">
          <button
            v-for="(button, index) in buttons"
            :key="button.icon"
            class="bg-black/50 p-2 flex rounded-full backdrop-blur-lg hover:bg-black/70 transition-colors"
            :style="{ '--delay': (buttons.length - index - 1) * 0.05 + 's' }"
          >
            <Icon :name="button.icon" size="1.25rem" @click="button.onClick" />
          </button>
        </template>
      </TransitionGroup>
      <button
        class="bg-black/50 p-2 flex rounded-full backdrop-blur-lg transition-all sm:opacity-0 group-hover:opacity-100 hover:bg-black/70"
        :class="{ 'rotate-45 sm:opacity-100': isOpen }"
        @click="isOpen = !isOpen"
      >
        <Icon name="mdi:plus" size="1.25rem" />
      </button>
    </div>
    <div
      class="h-full w-full absolute top-0 left-0 sm:block hidden z-9"
      @click="emit('image:click')"
    ></div>
    <div class="h-full w-full absolute top-0 left-0 z-8"></div>
    <img
      class="z-7"
      :src="imageUrl"
      :width="image.width"
      :height="image.height"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import type { Image } from '~/types/image';
const isOpen = ref(false);

const props = defineProps<{
  image: Image;
  canDownload: boolean;
  galleryId: number;
}>();

const emit = defineEmits(['image:click']);

const imageUrl = computed(() =>
  getS3Url(`gallery/${props.galleryId}/${props.image.fileName}`)
);

const buttons = computed(() => {
  const buttons = [];
  if (props.canDownload) {
    buttons.push({ icon: 'mdi:download', onClick: downloadImage });
  }
  buttons.push({ icon: 'material-symbols:photo-prints' });
  return buttons;
});

function downloadImage() {
  window.open(imageUrl.value, '_blank');
}
</script>

<style scoped>
.icons-enter-active,
.icons-leave-active {
  transition: all 0.15s ease-in-out;
  transition-delay: var(--delay);
}

.icons-enter-from,
.icons-leave-to {
  transform: translateX(100%);
  filter: blur(2px);
  opacity: 0;
  scale: 0.9;
}
</style>
