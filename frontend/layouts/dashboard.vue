<template>
  <div class="flex h-dvh">
    <div
      class="bg-neutral-900 h-screen overflow-hidden transition-all sm:w-64 w-full p-4 fixed flex flex-col z-10"
      :class="{ '-translate-x-full': !isShown }"
    >
      <header class="flex justify-between items-center mb-2">
        <div class="flex items-center gap-2">
          <Icon
            name="material-symbols:photo-library-outline-rounded"
            size="1.25rem"
          />
          <h1 class="text-lg font-semibold">Gallery</h1>
        </div>
        <UiButton
          icon="mdi:chevron-left"
          variant="outline"
          size="small"
          @click="isShown = !isShown"
        />
      </header>
      <nav class="flex flex-col flex-grow">
        <ul class="divide-y divide-neutral-800">
          <NuxtLink
            v-for="option in options"
            :key="option.name"
            :to="option.to"
            class="group flex items-center justify-between p-2 hover:bg-neutral-800 transition-colors"
          >
            <div class="flex items-center gap-2">
              <Icon :name="option.icon" />
              {{ option.name }}
            </div>
            <Icon
              v-if="!option.arrowHidden"
              name="mdi:chevron-right"
              class="group-hover:opacity-100 opacity-0 transition-opacity"
            />
          </NuxtLink>
        </ul>
      </nav>
      <div
        class="border-t border-neutral-800 flex items-center justify-between pt-4"
      >
        <span>{{ userStore.current?.username }}</span>
        <UiButton
          icon="mdi:logout"
          square
          :loading="isLoggingOut"
          @click="logout"
        />
      </div>
    </div>
    <UiButton
      class="absolute top-4 left-4 transition-all"
      :class="{
        'opacity-100': !isShown,
        'opacity-0': isShown
      }"
      icon="mdi:chevron-right"
      variant="outline"
      size="small"
      @click="isShown = !isShown"
    />
    <div class="transition-all w-full p-4" :class="{ 'ml-64': isShown }">
      <div v-if="route.meta.title" class="mb-2">
        <h2
          class="text-xl font-semibold transition-all"
          :class="{ 'ml-10': !isShown }"
        >
          {{ route.meta.title }}
        </h2>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();
const route = useRoute();
const isShown = ref(true);
const isLoggingOut = ref(false);

const options = computed(() => {
  if (route.meta.sidebar === 'gallery') {
    return [
      {
        name: 'Back',
        icon: 'mdi:arrow-left',
        to: `/dash/galleries`,
        arrowHidden: true
      },
      {
        name: 'General',
        icon: 'mdi:settings',
        to: `/dash/gallery/${route.params.galleryId}`
      },
      {
        name: 'Images',
        icon: 'mdi:image',
        to: `/dash/gallery/${route.params.galleryId}/images`
      },
      {
        name: 'Collections',
        icon: 'mdi:folder',
        to: `/dash/gallery/${route.params.galleryId}/collections`
      }
    ];
  }

  return [
    {
      name: 'Galleries',
      icon: 'material-symbols:photo-library-rounded',
      to: '/dash/galleries'
    }
  ];
});

function logout() {
  try {
    isLoggingOut.value = true;
    userStore.logout();
    navigateTo('/');
  } finally {
    isLoggingOut.value = false;
  }
}
</script>
