import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';

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
        redirect: () => {
          const userId = localStorage.getItem("userId") || "defaultUser";
          return `/tabs/tab1/${userId}`;
        }
      },
      {
        path: 'tab1/:userId',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'tab2/:userId',
        component: () => import('@/views/History.vue')
      },
      {
        path: 'tab3/:userId',
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
  {
    path: '/chat/:driverId/:rideId',
    component: () => import('@/views/Chat.vue'),
    name: 'Chat'
  }
  
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
