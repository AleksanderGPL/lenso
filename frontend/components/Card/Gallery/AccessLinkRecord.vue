<template>
  <li class="flex items-center justify-between p-2">
    <span class="text-sm truncate">{{ record.name }}</span>
    <div class="flex gap-2">
      <UiButton
        :icon="recentlyCopied ? 'material-symbols:check' : 'mdi:link'"
        variant="outline"
        size="small"
        @click="copyLink"
      ></UiButton>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { AccessKey } from '@/types/access-key';

const props = defineProps<{ record: AccessKey }>();
const recentlyCopied = ref(false);

function copyLink() {
  recentlyCopied.value = true;
  navigator.clipboard.writeText(
    `${new URL(window.location.href).origin}/gallery/${props.record.accessKey}`
  );
  setTimeout(() => {
    recentlyCopied.value = false;
  }, 1000);
}
</script>
