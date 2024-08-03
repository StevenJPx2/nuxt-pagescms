import type { PagesFile } from "#build/pages-cms/pages";

export default async function <
  Key extends keyof PagesFile,
  T extends PagesFile[Key],
>(path: Key) {
  const data = await $fetch(`/api/_pages-cms/files/${path}`);

  return data as T;
}
