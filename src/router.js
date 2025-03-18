import { createMemoryHistory, createRouter } from 'vue-router'

import HomeView from './pages/index.vue'
import SettingsView from './pages/settings.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

router.afterEach(() => {
  setTimeout(() => {
    window.api.redraw();
  }, 10);
});