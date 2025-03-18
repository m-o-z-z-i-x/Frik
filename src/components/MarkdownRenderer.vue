<script setup>
import { ref, watch } from "vue";
import { marked } from "marked";

const props = defineProps({
  content: String,
});

const htmlContent = ref("");

// Настройка `marked` с подсветкой кода
marked.setOptions({
  sanitize: true,
  breaks: true,
  gfm: true
});

const renderMarkdown = () => {
  htmlContent.value = marked(props.content || "");
};

// Слушаем изменения контента
watch(() => props.content, renderMarkdown, { immediate: true });
</script>

<template>
  <div class="prose max-w-none p-4">
    <div v-html="htmlContent" class="markdown-body"></div>
  </div>
</template>

<style>
/* Основные стили для текста */
.markdown-body {
  color: rgba(255, 255, 255, 0.9);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  color: white;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.markdown-body p {
  margin: 1em 0;
  line-height: 1.6;
}

/* Стили для ссылок */
.markdown-body a {
  color: #60a5fa;
  text-decoration: none;
  transition: color 0.2s;
}

.markdown-body a:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* Стили для блоков кода */
.markdown-body pre {
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.markdown-body code {
  font-family: "Fira Code", Consolas, "Courier New", monospace;
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  color: #e5e7eb;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
  color: #e5e7eb;
  display: block;
  line-height: 1.5;
}

/* Стили для списков */
.markdown-body ul,
.markdown-body ol {
  padding-left: 1.5em;
  margin: 1em 0;
}

.markdown-body li {
  margin: 0.5em 0;
}

/* Стили для цитат */
.markdown-body blockquote {
  border-left: 4px solid rgba(255, 255, 255, 0.2);
  margin: 1em 0;
  padding-left: 1em;
  color: rgba(255, 255, 255, 0.8);
}

/* Стили для таблиц */
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.5em;
  text-align: left;
}

.markdown-body th {
  color: white;
}

/* Стили для горизонтальной линии */
.markdown-body hr {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 2em 0;
}
</style>
