<script setup lang="ts">
const home = await usePagesFile("home");
const common = await usePagesFile("common");
const propertiesPage = await usePagesFile("propertiesPage");

const properties = await usePagesCollection("properties");
const faq = await usePagesCollection("faq");
const experiences = await usePagesCollection("experiences");

const files = computed(() => ({
  Home: home,
  Common: common,
  "Properties Page": propertiesPage,
}));

const collections = computed(() => ({
  Properties: properties,
  FAQ: faq,
  Experiences: experiences,
}));

const testValues = computed(() => ({
  Files: files.value,
  Collections: collections.value,
}));
</script>

<template>
  <template v-for="(obj, typeName) in testValues" :key="typeName">
    <h1>{{ typeName }}</h1>
    <template v-for="(value, name) in obj" :key="name">
      <h2>{{ name }}</h2>
      <pre>
        {{ JSON.stringify(value, null, 2) }}
      </pre>
    </template>
  </template>
</template>
