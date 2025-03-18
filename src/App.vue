<template>
  <RouterView />
</template>

<script setup>
import './index.css';
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// Обработчик события для переключения страниц
const handleChangePage = () => {
  const currentRoute = router.currentRoute.value.path;
  if (currentRoute === '/settings') {
    router.push('/');
  } else {
    router.push('/settings');
  }
};

// Проверка авторизации при запуске
onMounted(async () => {
  
  // Подписываемся на событие от main process
  window.api.receive('change-page', handleChangePage);
});

onUnmounted(() => {
  // Отписываемся от события при уничтожении компонента
  window.api.removeListener('change-page', handleChangePage);
});
</script>