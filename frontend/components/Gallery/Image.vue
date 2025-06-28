<template>
  <div class="relative group">
    <div v-if="showPlusButton" class="absolute top-2 right-2 flex gap-2 z-10">
      <TransitionGroup name="icons">
        <template v-if="isPlusMenuOpen">
          <button
            v-for="(button, index) in buttons"
            :key="button.icon"
            class="bg-black/50 p-2 flex rounded-full backdrop-blur-lg hover:bg-black/70 transition-colors"
            :style="{ '--delay': (buttons.length - index - 1) * 0.05 + 's' }"
            @click.stop="button.onClick"
          >
            <Icon :name="button.icon" size="1.25rem" />
          </button>
        </template>
      </TransitionGroup>
      <button
        class="bg-black/50 p-2 flex rounded-full backdrop-blur-lg transition-all sm:opacity-0 group-hover:opacity-100 hover:bg-black/70"
        :class="{ 'rotate-45 sm:opacity-100': isPlusMenuOpen }"
        @click="isPlusMenuOpen = !isPlusMenuOpen"
      >
        <Icon name="mdi:plus" size="1.25rem" />
      </button>
    </div>
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <DropdownBasePopup
        v-if="isCollectionsPopupOpen"
        popup-class="right-0 mr-2"
        @update:is-open="isCollectionsPopupOpen = $event"
      >
        <div class="flex items-center justify-between p-2">
          <p class="text-sm text-neutral-400">Collections</p>
          <UiButton
            icon="mdi:close"
            variant="outline"
            size="small"
            @click="isCollectionsPopupOpen = false"
          />
        </div>
        <div class="flex flex-col">
          <button
            v-for="collection in collections"
            :key="collection.id"
            class="p-2 hover:bg-neutral-800 transition-colors flex items-center gap-2"
            @click="toggleCollection(collection.id)"
          >
            <Transition name="fade" mode="out-in">
              <Icon
                :key="
                  image.collections.find(
                    (c) => c.collectionId === collection.id
                  )?.collectionId
                "
                :name="
                  image.collections.find(
                    (c) => c.collectionId === collection.id
                  )
                    ? 'mdi:check'
                    : 'mdi:checkbox-blank-outline'
                "
                class="transition-colors"
                :class="{
                  'text-green-500': pendingAdd.includes(collection.id),
                  'text-red-500': pendingRemove.includes(collection.id)
                }"
                size="1.25rem"
              />
            </Transition>
            <span> {{ collection.name }}</span>
          </button>
        </div>
      </DropdownBasePopup>
    </Transition>
    <div
      class="h-full w-full absolute top-0 left-0 sm:block hidden z-9"
      @click="emit('image:click')"
    ></div>
    <div class="h-full w-full absolute top-0 left-0 z-8"></div>
    <img
      class="z-7 pointer-events-none"
      :src="imageUrl"
      :width="image.width"
      :height="image.height"
      loading="lazy"
    />
  </div>
</template>

<script setup lang="ts">
import type { Collection } from '~/types/collection';
import type { Image } from '~/types/image';

const isPlusMenuOpen = ref(false);
const isCollectionsPopupOpen = ref(false);

const props = defineProps<{
  image: Image;
  collections: Collection[];
  canDownload: boolean;
  canUseCollections: boolean;
  galleryId: number;
  accessKey: string;
}>();

const api = useApi();
const emit = defineEmits([
  'image:click',
  'collection:remove',
  'collection:add'
]);
const pendingAdd = ref<number[]>([]);
const pendingRemove = ref<number[]>([]);

const imageUrl = computed(() =>
  getS3Url(`gallery/${props.galleryId}/${props.image.fileName}`)
);

const showPlusButton = computed(
  () => props.canDownload || props.canUseCollections
);

const buttons = computed(() => {
  const buttons = [];

  if (props.canDownload) {
    buttons.push({ icon: 'mdi:download', onClick: downloadImage });
  }

  if (props.canUseCollections && props.collections) {
    buttons.push({
      icon: 'material-symbols:photo-prints',
      onClick: () =>
        (isCollectionsPopupOpen.value = !isCollectionsPopupOpen.value)
    });
  }

  return buttons;
});

function downloadImage() {
  window.open(imageUrl.value, '_blank');
}

async function toggleCollection(id: number) {
  if (props.image.collections.find((c) => c.collectionId === id)) {
    try {
      pendingRemove.value.push(id);

      await api.delete(`/gallery/access/${props.accessKey}/collection/${id}`, {
        data: {
          imageId: props.image.id
        }
      });

      emit('collection:remove', id);
    } finally {
      pendingRemove.value = pendingRemove.value.filter((c) => c !== id);
    }
  } else {
    try {
      pendingAdd.value.push(id);

      await api.post(`/gallery/access/${props.accessKey}/collection/${id}`, {
        imageId: props.image.id
      });

      emit('collection:add', id);
    } finally {
      pendingAdd.value = pendingAdd.value.filter((c) => c !== id);
    }
  }
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
