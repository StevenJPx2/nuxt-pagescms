<!--
Get your module up and running quickly.

Find and replace all on all files (CMD+SHIFT+F):
- Name: Nuxt PagesCMS
- Package name: nuxt-pagescms
- Description: My new Nuxt module
-->

# Nuxt PagesCMS

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

[Nuxt][nuxt-href] integration of [PagesCMS](https://pagescms.org/).

- [✨ Release Notes](/CHANGELOG.md)
<!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/nuxt-pagescms?file=playground%2Fapp.vue) -->
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->
- 🥱 Zero config setup
- 💪 Fully type safe `usePagesFile` and `usePagesCollection`
- 🛡️ Auto-generated types for composables from `.pages.yml`
- 🤗 Fully SSR and SSG friendly!

## Usage
```vue
<script setup lang="ts">
const home = await usePagesFile("home"); // fully typed with only the files defined in .pages.yml

home; // fully typed based on the schema given in .pages.yml
</script>
```

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-pagescms
```

That's it! You can now use Nuxt PagesCMS in your Nuxt app ✨


## Contribution

### Local development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch


# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-pagescms/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-pagescms

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-pagescms.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-pagescms

[license-src]: https://img.shields.io/npm/l/nuxt-pagescms.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-pagescms

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
