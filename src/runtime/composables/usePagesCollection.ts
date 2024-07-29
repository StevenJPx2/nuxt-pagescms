import type { PagesCollection } from "#build/pages-cms/pages";
import { useFetch } from "#imports";

export default async function <
  Key extends keyof PagesCollection,
  T extends PagesCollection[Key],
>(path: Key) {
  const { data } = await useFetch(`/__pages-cms__/collections/${path}`);

  return data as unknown as Ref<T[]>;
}
