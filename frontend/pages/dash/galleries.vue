<template>
  <div>
    <div class="flex justify-between items-center w-full">
      <h2 class="text-xl font-semibold">Galleries</h2>
      <UiButton icon="mdi:plus" variant="outline" @click="isOpen = true"
        >Add gallery</UiButton
      >
    </div>
    <Teleport to="body">
      <Transition name="fade" mode="out-in">
        <ModalAddGallery v-if="isOpen" @close="isOpen = false" />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);

definePageMeta({
  layout: 'dashboard'
});
</script>
