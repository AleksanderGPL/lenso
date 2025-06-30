<template>
  <UiModal
    title="Copy filenames"
    card-class="sm:max-w-md w-full m-4"
    hide-footer
    @close="emit('cancel')"
  >
    <div class="flex flex-col gap-2">
      <div class="flex gap-1">
        <UiLabel for="includeExtension">Include extension</UiLabel>
        <UiToggle id="includeExtension" v-model="includeExtension" />
      </div>
      <UiTextArea readonly class="w-full" :model-value="cNames" />
      <UiButton
        class="w-full"
        :icon="recentlyCopied ? 'mdi:check' : 'mdi:content-copy'"
        @click="copy"
        >Copy</UiButton
      >
    </div>
  </UiModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  names: string[];
}>();

const emit = defineEmits(['cancel']);
const includeExtension = ref(false);
const recentlyCopied = ref(false);

const cNames = computed(() => {
  if (includeExtension.value) {
    return props.names.join(', ');
  }
  return props.names.map((name) => name.split('.')[0]).join(', ');
});

function copy() {
  navigator.clipboard.writeText(cNames.value);
  recentlyCopied.value = true;
  setTimeout(() => {
    recentlyCopied.value = false;
  }, 2000);
}
</script>
