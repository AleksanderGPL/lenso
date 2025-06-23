<template>
  <div class="flex flex-col w-full h-screen items-center justify-center gap-4">
    <h1 class="text-6xl font-bold">Gallery</h1>
    <div class="flex gap-2">
      <UiButton :as="NuxtLink" to="/auth/sign-up">Sign up</UiButton>
      <UiButton :as="NuxtLink" to="/auth/sign-in">Sign in</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components';
</script>
