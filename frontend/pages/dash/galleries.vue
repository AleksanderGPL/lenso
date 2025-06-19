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
        <UiModal
          card-class="w-md"
          @close="isOpen = false"
          v-if="isOpen"
          title="Add gallery"
        >
          <template #footer>
            <UiButton @click="isOpen = false" size="small" icon="mdi:plus"
              >Create</UiButton
            >
          </template>
        </UiModal>
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
