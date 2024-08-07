// @ts-expect-error virtual file
import collections from "#pages-cms/pages/collection";
// @ts-expect-error virtual file
import files from "#pages-cms/pages/file";
import { defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const pageTypes = { collections, files };

  const pageTypeKey = getRouterParam(event, "type");

  if (!pageTypeKey || !Object.keys(pageTypes).includes(pageTypeKey))
    throw new Error(`Page type not found: ${pageTypeKey} `);

  const pageType = pageTypes[pageTypeKey as keyof typeof pageTypes];
  const page = getRouterParam(event, "page");

  if (!page || !pageType[page]) {
    throw new Error(`Collection not found: ${page} [${pageType}]`);
  }

  return pageType[page].content;
});
