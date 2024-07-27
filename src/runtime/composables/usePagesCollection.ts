import type { PagesCollection } from "#build/pages-cms/pages";
import { useFetch } from "#imports";

export default async function <
  Key extends keyof PagesCollection,
  T extends PagesCollection[Key],
>(path: Key) {
  const { data } = await useFetch(`/api/pages/collections/${path}`);

  if (!data.value) throw new Error(`Collection: ${path} not found`);

  return data as unknown as Ref<T[]>;
}
