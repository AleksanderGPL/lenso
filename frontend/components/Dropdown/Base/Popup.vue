<template>
  <div
    ref="dropdownRef"
    class="absolute mt-2 w-48 max-h-48 sm:max-h-64 overflow-y-auto bg-neutral-900 border border-neutral-600 rounded-lg shadow-lg z-10 divide-y divide-neutral-700 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-500"
    :class="popupClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  popupClass?: string;
}>();

const dropdownRef = ref<HTMLElement | null>(null);

const emit = defineEmits(['update:isOpen']);

function closeDropdown(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    emit('update:isOpen', false);
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>
