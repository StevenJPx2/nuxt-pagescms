import type { PagesFile } from "#build/pages-cms/pages";

export async function useFile<
  Key extends keyof PagesFile,
  T extends PagesFile[Key],
>(path: Key) {
  const { data } = await useFetch(`/api/pages/files/${path}`);

  if (!data.value) throw new Error(`File: ${path} not found`);

  return data as unknown as Ref<T>;
}
