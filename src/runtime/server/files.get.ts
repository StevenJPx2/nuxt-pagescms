// @ts-expect-error virtual file
import files from "#pages-cms/pages/file";
import { defineEventHandler, getRouterParam } from "h3";

export default defineEventHandler(async (event) => {
  const page = getRouterParam(event, "page");

  if (!page || !files[page]) {
    throw new Error(`File not found: ${page}`);
  }

  return files[page].content;
});
