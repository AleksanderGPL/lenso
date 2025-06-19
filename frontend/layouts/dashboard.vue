<template>
  <div class="flex h-dvh">
    <div
      class="bg-neutral-900 h-screen overflow-hidden transition-all"
      :class="{ 'w-64 p-4': isShown, 'w-0 p-0': !isShown }"
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
      <nav class="flex flex-col">
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
              name="mdi:chevron-right"
              class="group-hover:opacity-100 opacity-0 transition-opacity"
            />
          </NuxtLink>
        </ul>
      </nav>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const isShown = ref(true);

const options = [
  {
    name: 'Home',
    icon: 'mdi:home',
    to: '/dash'
  },
  {
    name: 'Profile',
    icon: 'mdi:account',
    to: '/dash/profile'
  }
];
</script>
