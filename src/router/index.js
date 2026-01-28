import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: '药材百科' },
  },
  {
    path: '/herb/:id',
    name: 'HerbDetail',
    component: () => import('@/views/HerbDetailView.vue'),
    meta: { title: '药材详情' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const t = to.meta?.title
  if (t) document.title = `${t} · 中药材百科`
})

export default router
