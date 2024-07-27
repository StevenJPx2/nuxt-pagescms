/**
 * Directly ripped from PagesCMS for feature parity
 * Handles frontmatter parsing and stringifying with support for YAML, TOML, and JSON.
 */

import YAML from "yaml";
import * as TOML from "smol-toml";
import type { Format } from "../formats";

/**
 * Serialize an object to a YAML/JSON/TOML string
 */
export const serialize = (
  contentObject: Record<string, unknown> = {},
  format: Format = "yaml",
) => {
  if (Object.keys(contentObject).length === 0) return ""; // Empty object returns an empty string
  switch (format) {
    case "yaml":
      return YAML.stringify(contentObject);
    case "json":
      return JSON.stringify(contentObject, null, 2);
    case "toml":
      return TOML.stringify(contentObject);
  }
};
