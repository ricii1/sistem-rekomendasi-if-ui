import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ChatWithConversations from "../views/ChatPage.vue";

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: "/chat",
    name: "chat",
    component: ChatWithConversations,
    meta: { requiresAuth: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token') !== null;

  if (to.path === '/') {
    if (isAuthenticated) return next('/chat');
    return next();
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    localStorage.setItem('redirect_alert', JSON.stringify({
      type: 'warning',
      message: 'Anda harus login terlebih dahulu untuk mengakses halaman ini'
    }));
    return next('/login');
  }

  if ((to.path === '/login' || to.path === '/register') && isAuthenticated)
    return next('/');

  next();
});

export default router;
