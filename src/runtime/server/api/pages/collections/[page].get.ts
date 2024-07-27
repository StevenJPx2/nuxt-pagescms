// @ts-expect-error virtual file
import collection from "#pages-cms/pages/collection";
import { defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, "page");

  if (!page || !collection[page]) {
    throw new Error(`Collection not found: ${page} [${collection}]`);
  }

  return collection[page].content;
});
