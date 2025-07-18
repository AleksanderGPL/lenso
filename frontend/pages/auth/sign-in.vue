<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Sign in</h1>
    <form class="flex flex-col gap-2" @submit.prevent="signIn">
      <div>
        <UiLabel for="email">Email</UiLabel>
        <UiInput
          id="email"
          v-model="email"
          placeholder="john.doe@example.com..."
          autocomplete="email"
          class="w-full"
        />
      </div>
      <div>
        <UiLabel for="password">Password</UiLabel>
        <UiInput
          id="password"
          v-model="password"
          placeholder="Password..."
          autocomplete="current-password"
          type="password"
          class="w-full"
        />
      </div>
      <UiButton class="mt-2" :loading="isLoading">Sign in</UiButton>
      <div class="flex justify-between sm:flex-row flex-col">
        <NuxtLink to="/auth/sign-up" class="sm:text-left text-center"
          >Don't have an account?</NuxtLink
        >
        <NuxtLink to="/auth/reset-password" class="sm:text-right text-center"
          >Forgot password?</NuxtLink
        >
      </div>
      <p v-if="error" class="text-red-500 text-sm mt-2 text-center">
        {{ error }}
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { loginSchema } from '@/schema/services/auth';
import { AxiosError } from 'axios';

definePageMeta({
  layout: 'auth'
});

const email = ref('');
const password = ref('');
const api = useApi();
const userStore = useUserStore();
const isLoading = ref(false);

const error = ref('');

if (userStore.current) {
  navigateTo('/dash');
}

async function signIn() {
  try {
    isLoading.value = true;
    error.value = '';
    const validation = validate(loginSchema, {
      email: email.value,
      password: password.value
    });

    if (validation) {
      error.value = validation;
      return;
    }

    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    userStore.current = response.data;
    navigateTo('/dash');
  } catch (e) {
    if (e instanceof AxiosError) {
      error.value = e.response?.data.message;
    } else {
      error.value = 'Something went wrong';
    }
  } finally {
    isLoading.value = false;
  }
}
</script>
