import type { PagesCollection } from "#build/pages-cms/pages";

export default async function <
  Key extends keyof PagesCollection,
  T extends PagesCollection[Key],
>(path: Key) {
  const data = await $fetch(`/api/_pages-cms/collections/${path}`);

  return data as T[];
}
