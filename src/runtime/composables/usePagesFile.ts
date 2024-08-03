import type { PagesFile } from "#build/pages-cms/pages";
import { useNuxtApp } from "#app";
import { useFetch } from "#imports";

export default async function <
  Key extends keyof PagesFile,
  T extends PagesFile[Key],
>(path: Key) {
  const nuxt = useNuxtApp();
  // @ts-expect-error excessive stack depth
  const { data } = await nuxt.runWithContext(
    async () => await useFetch(`/api/_pages-cms/files/${path}`),
  );

  return data as unknown as Ref<T>;
}
