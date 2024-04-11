// @ts-ignore
import collection from "#pages-cms/pages/collection";

export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, "page");

  if (!page || !collection[page]) {
    throw new Error(`Collection not found: ${page} [${collection}]`);
  }

  return collection[page].content;
});
