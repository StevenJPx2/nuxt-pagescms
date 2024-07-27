/**
 * Directly ripped from PagesCMS for feature parity
 * Handles frontmatter parsing and stringifying with support for YAML, TOML, and JSON.
 */

import YAML from "yaml";
import * as TOML from "smol-toml";
import type { Format } from "../formats";

/**
 * Deserialize a YAML/JSON/TOML string to an object
 */
export const deserialize = (
  content = "",
  format: Format = "yaml",
): Record<string, unknown> => {
  if (!content.trim()) return {}; // Empty content returns an empty object
  switch (format) {
    case "yaml":
      return YAML.parse(content, { strict: false, uniqueKeys: false });
    case "json":
      return JSON.parse(content);
    case "toml":
      return TOML.parse(content);
  }
};
