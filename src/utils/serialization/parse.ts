/**
 * Directly ripped from PagesCMS for feature parity
 * Handles frontmatter parsing and stringifying with support for YAML, TOML, and JSON.
 */

import { split } from "string-ts";
import type { Format, FormatFrontmatter } from "../formats";
import type { ReadOptions } from "./types";
import { deserialize } from "./deserialize";
import { setDelimiter } from "./set-delimiter";

/**
 * Parse straight YAML/JSON/TOML and YAML/JSON/TOML frontmatter strings into an object
 */
export const parse = (content = "", options: ReadOptions = {}) => {
  const format = options.format || "yaml-frontmatter";

  // YAML/JSON/TOML without frontmatter
  if (["yaml", "json", "toml"].includes(format))
    return deserialize(content, format as Format);

  // Frontmatter
  const delimiters = setDelimiter(
    options.delimiters,
    format as FormatFrontmatter,
  );
  const startDelimiter = delimiters[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const endDelimiter = delimiters[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const frontmatterRegex = new RegExp(
    `^(${startDelimiter}(?:\\n|\\r)?([\\s\\S]+?)(?:\\n|\\r)?${endDelimiter})\\n*([\\s\\S]*)`,
  );
  const match = frontmatterRegex.exec(content);
  let contentObject: { body: string; [x: string]: unknown };
  if (!match) {
    return { body: content };
  } else {
    contentObject = {
      ...deserialize(match[2], split(format as FormatFrontmatter, "-")[0]),
      body: "",
    };
  }
  contentObject.body = match[3] || "";
  contentObject.body = contentObject["body"].replace(/^\n/, "");

  return contentObject;
};
