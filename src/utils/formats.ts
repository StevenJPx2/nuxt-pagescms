export const FormatTuple = ["yaml", "toml", "json"] as const;

export type Format = (typeof FormatTuple)[number];

export type FormatFrontmatter = `${Format}-frontmatter`;

export type FullFormat = Format | FormatFrontmatter;
