<template>
  <component
    :is="as"
    class="flex items-center justify-center gap-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'px-2 py-1': size === 'small' && !square,
      'px-4 py-2': size === 'medium' && !square,
      'px-6 py-3': size === 'large' && !square,
      'p-2': square,
      'bg-neutral-900 hover:bg-neutral-800': ['default', 'outline'].includes(
        variant
      ),
      'border border-neutral-700': variant === 'outline',
      'bg-red-500 hover:bg-red-600': variant === 'danger'
    }"
    :disabled="loading || disabled"
    v-bind="$attrs"
  >
    <Transition name="fade" mode="out-in">
      <UiLoader v-if="loading" :size="1" variant="white" />
      <Icon v-else-if="icon" :key="icon" :name="icon" />
    </Transition>
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: string | Component;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'outline' | 'danger';
    square?: boolean;
  }>(),
  {
    as: 'button',
    icon: undefined,
    loading: false,
    disabled: false,
    size: 'medium',
    variant: 'default',
    square: false
  }
);
</script>
