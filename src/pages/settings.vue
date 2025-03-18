<template>
  <div v-if="$route.path === '/settings'" class="min-h-screen bg-black">
    <!-- Шапка -->
    <div class="navbar mb-6">
      <div class="flex-1">
        <h1 class="text-xl font-semibold text-white">Настройки</h1>
      </div>
      <div class="flex-none">
          <div class="flex items-center space-x-1">
            <span class="text-white">На главную</span>
            <span class="kbd kbd-sm">⌘</span>
            <span class="text-white">/</span>
          </div>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="space-y-6">
      <!-- Секция шорткатов -->
      <div class="card border border-white/20">
        <div class="card-body">
          <h2 class="card-title text-white mb-4">Горячие клавиши</h2>
          <div class="grid grid-cols-1 gap-4">
            <div class="flex items-center space-x-3">
              <div class="flex space-x-1">
                <kbd class="kbd kbd-sm">⌘</kbd>
                <span class="text-white">+</span>
                <kbd class="kbd kbd-sm">B</kbd>
              </div>
              <span class="text-white/80">Показать/скрыть окно</span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="flex space-x-1">
                <kbd class="kbd kbd-sm">⌘</kbd>
                <span class="text-white">+</span>
                <div class="flex space-x-1">
                  <kbd class="kbd kbd-sm">↑</kbd>
                  <kbd class="kbd kbd-sm">↓</kbd>
                  <kbd class="kbd kbd-sm">←</kbd>
                  <kbd class="kbd kbd-sm">→</kbd>
                </div>
              </div>
              <span class="text-white/80">Переместить окно</span>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="flex space-x-1">
                <kbd class="kbd kbd-sm">⌘</kbd>
                <span class="text-white">+</span>
                <kbd class="kbd kbd-sm">⇧</kbd>
                <span class="text-white">+</span>
                <kbd class="kbd kbd-sm">S</kbd>
              </div>
              <span class="text-white/80">Сделать скриншот</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Секция API ключа -->
      <div class="card border border-white/20">
        <div class="card-body">
          <h2 class="card-title text-white mb-4">API Ключ от OpenAI</h2>
          <div class="form-control w-full">
            <div class="flex flex-col space-y-2">
              <input 
                v-model="apiKey"
                placeholder="Введите API ключ" 
                class="input bg-white/10 border-white/20 text-white w-full"
              />
              <div class="flex justify-between items-center">
                <button 
                  @click="saveApiKey" 
                  class="btn btn-primary btn-sm"
                  :disabled="isSaving"
                >
                  {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
              <div v-if="saveError" class="text-error text-sm">{{ saveError }}</div>
              <div v-if="saveSuccess" class="text-success text-sm">API ключ успешно сохранен</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Секция языка программирования -->
      <div class="card border border-white/20">
        <div class="card-body">
          <h2 class="card-title text-white mb-4">Язык программирования</h2>
          <div class="form-control w-full">
            <div class="flex flex-col space-y-2">
              <select 
                v-model="programmingLanguage"
                class="select bg-white/10 border-white/20 text-white w-full"
              >
                <option value="TypeScript">TypeScript</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
                <option value="Rust">C#</option>
                <option value="Rust">SQL</option>
                <option value="Rust">Kotlin</option>
                <option value="Rust">Swift</option>
              </select>
              <div class="flex justify-between items-center">
                <label class="label">
                  <span class="label-text text-white/60">Язык, на котором будут предоставляться решения</span>
                </label>
                <button 
                  @click="saveProgrammingLanguage" 
                  class="btn btn-primary btn-sm"
                  :disabled="isSavingLanguage"
                >
                  {{ isSavingLanguage ? 'Сохранение...' : 'Сохранить' }}
                </button>
              </div>
              <div v-if="languageSaveError" class="text-error text-sm">{{ languageSaveError }}</div>
              <div v-if="languageSaveSuccess" class="text-success text-sm">Язык программирования успешно сохранен</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const settings = ref({
  autoStart: false,
  notifications: true
});

const apiKey = ref('');
const isSaving = ref(false);
const saveError = ref('');
const saveSuccess = ref(false);

const programmingLanguage = ref('TypeScript');
const isSavingLanguage = ref(false);
const languageSaveError = ref('');
const languageSaveSuccess = ref(false);

// Загрузка настроек при монтировании компонента
onMounted(async () => {
  try {
    // Загрузка API ключа
    const apiResult = await window.api.invoke('get-api-key');
    if (apiResult.success) {
      apiKey.value = apiResult.apiKey;
    }

    // Загрузка языка программирования
    const languageResult = await window.api.invoke('get-programming-language');
    if (languageResult.success) {
      programmingLanguage.value = languageResult.language;
    }
  } catch (error) {
    console.error('Ошибка при загрузке настроек:', error);
  }
});

// Сохранение API ключа
const saveApiKey = async () => {
  isSaving.value = true;
  saveError.value = '';
  saveSuccess.value = false;

  try {
    const result = await window.api.invoke('save-api-key', apiKey.value);
    if (result.success) {
      saveSuccess.value = true;
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    } else {
      saveError.value = result.error || 'Произошла ошибка при сохранении';
    }
  } catch (error) {
    saveError.value = 'Произошла ошибка при сохранении';
    console.error('Ошибка при сохранении API ключа:', error);
  } finally {
    isSaving.value = false;
  }
};

// Сохранение языка программирования
const saveProgrammingLanguage = async () => {
  isSavingLanguage.value = true;
  languageSaveError.value = '';
  languageSaveSuccess.value = false;

  try {
    const result = await window.api.invoke('save-programming-language', programmingLanguage.value);
    if (result.success) {
      languageSaveSuccess.value = true;
      setTimeout(() => {
        languageSaveSuccess.value = false;
      }, 3000);
    } else {
      languageSaveError.value = result.error || 'Произошла ошибка при сохранении';
    }
  } catch (error) {
    languageSaveError.value = 'Произошла ошибка при сохранении';
    console.error('Ошибка при сохранении языка программирования:', error);
  } finally {
    isSavingLanguage.value = false;
  }
};
</script>