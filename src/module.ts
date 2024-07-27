import * as fs from "node:fs";

import {
  addImportsDir,
  addServerScanDir,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  updateTemplates,
} from "nuxt/kit";

import { load } from "js-yaml";
import { format } from "prettier";
import { parse } from "./utils";
import { camelCase, join, pascalCase } from "string-ts";
import { fdir } from "fdir";
import type { Format, FullFormat } from "./utils/formats";

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

    const _templateName = `${virtualFilePath}/pages-cms.mjs`;
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

      for (const { name, type, path: partialPath, format } of content) {
        const path = `${nuxt.options.srcDir}/${partialPath}`;
        const resolvedFormat =
          format ?? ((path.split(".").at(-1) as Format) || "yaml-frontmatter");

        const resolvedName = camelCase(name);

        if (type === "file") {
          types.file[resolvedName] = {
            content: parse(fs.readFileSync(path, "utf-8"), {
              format: resolvedFormat,
            }),
          };
        } else {
          types.collection[resolvedName] = {
            content: new fdir()
              .glob(`${path}/*.${resolvedFormat}`)
              .withBasePath()
              .crawl(path)
              .sync()
              .map((page) =>
                parse(fs.readFileSync(page, "utf-8"), {
                  format: resolvedFormat,
                }),
              ),
          };
        }
      }

      nitroConfig.virtual = nitroConfig.virtual || {};

      for (const type in types) {
        nitroConfig.virtual[`#pages-cms/pages/${type}`] =
          `export default ${JSON.stringify(types[type], null, 2)}`;
      }
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
          template += `export type ${typifiedName} = { ${fields
            .map(renderField)
            .join(";\n")} };\n`;

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
          template += `export type ${pascalCase(
            join([options.typePrefix, type], "-"),
          )} = { ${fields}\n };`;
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
      options?: { values: (string | { value: string; label: string })[] };
    }
);

type Config = {
  content: {
    name: string;
    type: "file" | "collection";
    path: string;
    format?: FullFormat;
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

  return `${field.name}${!field.required ? "?" : ""}: ${type}${
    field.list ? "[]" : ""
  }`;
};
