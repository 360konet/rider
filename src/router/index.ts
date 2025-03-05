import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/History.vue')
      },
      {
        path: 'tab3',
        component: () => import('@/views/Profile.vue')
      }
    ]
  },

  {
    path: '/login',
    component: () => import('@/views/Auth/Login.vue')
  },

  {
    path: '/register',
    component: () => import('@/views/Auth/Register.vue')
  },

]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
