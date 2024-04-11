import {
  defineNuxtModule,
  addTypeTemplate,
  addImportsDir,
  createResolver,
  updateTemplates,
  addServerScanDir,
} from "nuxt/kit";
import fs from "fs";
import { load } from "js-yaml";
import { pascalCase, camelCase, join } from "string-ts";
import { format } from "prettier";
import { parse } from "smol-toml";

import glob from "tiny-glob";

interface ModuleOptions {
  typePrefix: string;
  typeVirtualFileName: `${string}.d.ts`;
}

export default defineNuxtModule<ModuleOptions>({
  defaults: {
    typePrefix: "Pages",
    typeVirtualFileName: "pages.d.ts",
  },
  async setup(options, nuxt) {
    const virtualFilePath = "pages-cms";
    const { content } = load(
      fs.readFileSync(`${nuxt.options.srcDir}/.pages.yml`, "utf-8"),
    ) as Config;

    const templateName = `${virtualFilePath}/pages-cms.mjs`;
    const typeTemplateName =
      `${virtualFilePath}/${options.typeVirtualFileName}` as const;

    nuxt.hook("nitro:config", async (nitroConfig) => {
      const types: Record<
        Config["content"][number]["type"],
        Record<string, unknown>
      > = {
        file: {},
        collection: {},
      };

      for (const { name, type, path, format } of content) {
        const resolvedFormat =
          format ?? (path.split(".").at(-1) || "yaml-frontmatter");

        const resolvedName = camelCase(name);

        if (type === "file") {
          types.file[resolvedName] = {
            content: parse(fs.readFileSync(path, "utf-8")),
          };
        } else {
          types.collection[resolvedName] = {
            content: (await glob(`${path}/*.${resolvedFormat}`)).map((page) =>
              parse(fs.readFileSync(page, "utf-8")),
            ),
          };
        }
      }

      nitroConfig.virtual = nitroConfig.virtual || {};

      nitroConfig.virtual["#pages-cms/pages/file"] = await format(
        "export default " + JSON.stringify(types.file),
        {
          parser: "typescript",
        },
      );

      nitroConfig.virtual["#pages-cms/pages/collection"] = await format(
        "export default " + JSON.stringify(types.collection),
        {
          parser: "typescript",
        },
      );
    });

    addTypeTemplate({
      filename: typeTemplateName,
      getContents: async () => {
        let template = "";

        const types: Record<Config["content"][number]["type"], string[]> = {
          file: [],
          collection: [],
        };

        for (const { name, type, fields } of content) {
          const typifiedName = pascalCase(
            join([options.typePrefix, name], "-"),
          );
          template += `export type ${typifiedName} = { ${fields.map(renderField).join(";\n")} };\n`;

          types[type].push(typifiedName);
        }

        for (const type in types) {
          const pages = types[type as keyof typeof types];
          const fields = pages
            .map(
              (value) =>
                `${camelCase(value.replace(options.typePrefix, ""))}: ${value}`,
            )
            .join(";\n");
          template += `export type ${pascalCase(join([options.typePrefix, type], "-"))} = { ${fields}\n };`;
        }

        return await format(template, { parser: "typescript" });
      },
    });

    nuxt.hook("builder:watch", async (_, path) => {
      if (path.includes(".pages.yml")) {
        updateTemplates({
          filter: (t) => typeTemplateName === t.filename,
        });
      }
    });

    const { resolve } = createResolver(import.meta.url);

    addServerScanDir(resolve("./runtime/server"));
    addImportsDir(resolve("./runtime/composables"));
  },
});

type Field = { name: string; list?: boolean; required?: boolean } & (
  | {
      type:
        | "string"
        | "number"
        | "boolean"
        | "rich-text"
        | "text"
        | "code"
        | "date"
        | "image";
    }
  | { type: "object"; fields: Field[] }
  | {
      type: "select";
      options?: { values: string[] | { value: string; label: string }[] };
    }
);

type Config = {
  content: {
    name: string;
    type: "file" | "collection";
    path: string;
    format?: string;
    fields: Field[];
  }[];
};

const renderField = (field: Field): string => {
  let type = "string";
  if (field.type === "number") type = "number";
  else if (field.type === "boolean") type = "boolean";
  else if (field.type === "date") type = "Date";
  else if (field.type === "select") {
    type =
      field.options?.values
        .map((v) => {
          const value = typeof v === "string" ? v : v.value;
          return `"${value}"`;
        })
        .join(" | ") ?? "string";
  }

  if (field.type === "object") {
    type = `{ ${field.fields.map(renderField).join("; ")} }`;
  }

  return `${field.name}${!field.required ? "?" : ""}: ${type}${field.list ? "[]" : ""}`;
};
