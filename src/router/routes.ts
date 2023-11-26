import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{
      path: '', components: {
        // default: () => import('pages/IndexPage.vue'),
        default: () => import('pages/MainPage.vue'),
        LeftSidebarContent: () => import('pages/MainLeftDrawer.vue'),
        RightSidebarContent: () => import('pages/MainRightDrawer.vue'),
      }
    }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
