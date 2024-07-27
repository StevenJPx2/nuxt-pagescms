/**
 * Directly ripped from PagesCMS for feature parity
 * Handles frontmatter parsing and stringifying with support for YAML, TOML, and JSON.
 */

import type { Format, FormatFrontmatter } from "../formats";
import type { ReadOptions } from "./types";
import { serialize } from "./serialize";
import { setDelimiter } from "./set-delimiter";
import { split } from "string-ts";

/**
 * Convert an object into straight YAML/JSON/TOML or YAML/JSON/TOML frontmatter strings
 */
export const stringify = (
  contentObject: Record<string, unknown> = {},
  options: ReadOptions = {},
) => {
  const format = options.format || "yaml-frontmatter";
  // YAML/JSON/TOML without frontmatter
  if (["yaml", "json", "toml"].includes(format))
    return serialize(contentObject, format as Format);

  // Frontmatter
  const delimiters = setDelimiter(
    options.delimiters,
    format as FormatFrontmatter,
  );
  const contentObjectCopy = structuredClone(contentObject); // Avoid mutating our object
  const body = contentObjectCopy.body || "";
  delete contentObjectCopy.body;

  let frontmatter = serialize(
    contentObjectCopy,
    split(format as FormatFrontmatter, "-")[0],
  );
  frontmatter = frontmatter.trim() ? frontmatter.trim() + "\n" : ""; // Make sure we don't have extra newlines

  return `${delimiters[0]}\n${frontmatter}${delimiters[1]}\n${body}`;
};
