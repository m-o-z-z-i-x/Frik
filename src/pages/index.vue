<template>
  <div v-show="$route.path === '/'" class="container">
    <!-- Шапка с кнопкой настроек -->
    <div class="navbar mb-6">
      <div class="flex flex-col">
          <div class="flex items-center space-x-1">
            <span class="kbd kbd-xs">⌘</span>
            <span class="kbd kbd-xs">/</span>
            <span class="text-white text-sm">Settings</span>
          </div>
          <div class="flex items-center space-x-1">
            <span class="kbd kbd-xs">⌘</span>
            <span class="kbd kbd-xs">B</span>
            <span class="text-white text-sm">Show/Hide</span>
          </div>
      </div>
    </div>

    <!-- Поле для текста с сервера -->
    <div class="card border border-white/20">
      <div class="card-body">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-8">
          <div class="loading loading-spinner loading-lg text-white"></div>
          <p class="text-white/60 mt-4">Обработка изображения...</p>
        </div>
        <div v-else-if="!serverText" class="text-white/60">
          <div class="flex items-center space-x-1">
            <span class="kbd kbd-xs">⌘</span>
            <span class="kbd kbd-xs">⇧</span>
            <span class="kbd kbd-xs">S</span>
            <span class="text-white text-sm">Start resolve problem</span>
          </div>
        </div>
        <MarkdownRenderer 
          v-else 
          class="markdown-body text-white"
          :content="renderedMarkdown"
        ></MarkdownRenderer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import MarkdownRenderer from '../components/MarkdownRenderer.vue';

const serverText = ref('');
const isLoading = ref(false);

// Рендеринг markdown в HTML
const renderedMarkdown = computed(() => {
  if (!serverText.value) return '';
  return serverText.value;
});

// Обработчик обновления текста от main process
const handleUpdateText = (text) => {
  serverText.value = text;
  isLoading.value = false;
};

onMounted(async () => {

  window.api.receive('update-server-text', handleUpdateText);
  window.api.receive('start-processing', () => {
    isLoading.value = true;
  });
});

onUnmounted(() => {
  window.api.removeListener('update-server-text', handleUpdateText);
  window.api.removeListener('start-processing', () => {
    isLoading.value = true;
  });
});
</script>

<style scoped>
.container {
  margin: 0 auto;
  color: #fff;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.server-text-container {
  background-color: transparent;
  min-height: 200px;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

pre {
      background: rgba(40,40,40,0.95);
      color: #f0f0f0;
      padding: 15px;
      border-radius: 6px;
      white-space: pre;
      overflow-x: auto;
      margin: 1em 0;
      border: 1px solid rgba(255,255,255,0.1);
}
    
code {
  font-family: 'Fira Code', Consolas, 'Courier New', monospace;
  background: rgba(60,60,60,0.95);
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>

