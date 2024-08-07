import * as fs from "node:fs";

import {
  addImportsDir,
  addServerHandler,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  updateTemplates,
} from "@nuxt/kit";

import { parse as yamlParse } from "yaml";
import { format } from "prettier";
import { parse } from "./utils";
import { camelCase, join, pascalCase } from "string-ts";
import { fdir } from "fdir";
import type { Format } from "./utils/formats";
import { type Config, type ContentType, renderField } from "./utils/config";

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
    const { content } = yamlParse(
      fs.readFileSync(`${nuxt.options.srcDir}/.pages.yml`, "utf-8"),
    ) as Config;

    const _templateName = `${virtualFilePath}/pages-cms.mjs`;
    const typeTemplateName =
      `${virtualFilePath}/${options.typeVirtualFileName}` as const;

    nuxt.hook("nitro:config", async (nitroConfig) => {
      const types: Record<ContentType, Record<string, unknown>> = {
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
          `export default ${JSON.stringify(types[type as ContentType], null, 2)}`;
      }
    });

    addTypeTemplate({
      filename: typeTemplateName,
      getContents: async () => {
        let template = "";

        const types: Record<ContentType, string[]> = {
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

    addServerHandler({
      route: "/api/_pages-cms/:type/:page",
      handler: resolve("./runtime/server/pages.get"),
    });

    addImportsDir(resolve("./runtime/composables"));
  },
});
