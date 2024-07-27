import type { FullFormat } from "./formats";

export type Field = { name: string; list?: boolean; required?: boolean } & (
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

export type ContentType = "file" | "collection";

export type Config = {
  content: {
    name: string;
    type: ContentType;
    path: string;
    format?: FullFormat;
    fields: Field[];
  }[];
};

export const renderField = (field: Field): string => {
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
