import axios from 'axios';

export function useApi() {
  const headers: Record<string, string> = {};

  if (import.meta.env.SSR) {
    const cookieHeader = useRequestHeaders(['cookie']);
    if (cookieHeader.cookie) {
      headers.cookie = cookieHeader.cookie;
    }
  }

  const api = axios.create({
    baseURL: useRuntimeConfig().public.apiBase + '/api',
    withCredentials: true,
    headers
  });

  return api;
}
