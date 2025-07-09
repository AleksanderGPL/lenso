export function getS3Url(key: string) {
  const runtimeConfig = useRuntimeConfig();
  return `${runtimeConfig.public.s3Base}/${key}`;
}
