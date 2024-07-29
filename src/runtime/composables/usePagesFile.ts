import type { PagesFile } from "#build/pages-cms/pages";
import { useFetch } from "#imports";

export default async function <
  Key extends keyof PagesFile,
  T extends PagesFile[Key],
>(path: Key) {
  const { data } = await useFetch(`/__pages-cms__/files/${path}`);

  return data as unknown as Ref<T>;
}
