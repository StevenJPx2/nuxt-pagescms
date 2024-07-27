/**
 * Directly ripped from PagesCMS for feature parity
 * Handles frontmatter parsing and stringifying with support for YAML, TOML, and JSON.
 */

import type { FormatFrontmatter } from "../formats";

/**
 * Sets the start/end delimiters for frontmatter
 */
export const setDelimiter = (
  delimiters: string | [string, string] | undefined,
  format: FormatFrontmatter,
): [string, string] => {
  if (delimiters === undefined) {
    switch (format) {
      case "toml-frontmatter":
        delimiters = "+++";
        break;
      case "json-frontmatter":
      case "yaml-frontmatter":
      default:
        delimiters = "---";
    }
  }

  if (typeof delimiters === "string") {
    return [delimiters, delimiters];
  }

  return delimiters;
};
