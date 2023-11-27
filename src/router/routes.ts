import { RouteRecordRaw } from 'vue-router';

import MainPageVue from 'pages/MainPage.vue';
import MainLayoutVue from 'layouts/MainLayout.vue';
import MainLeftDrawerVue from 'pages/MainLeftDrawer.vue';
import MainRightDrawerVue from 'pages/MainRightDrawer.vue';
import ErrorNotFoundVue from 'pages/ErrorNotFound.vue';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayoutVue,
    children: [{
      path: '', components: {
        // default: () => import('pages/IndexPage.vue'),
        default: MainPageVue,
        LeftSidebarContent: MainLeftDrawerVue,
        RightSidebarContent: MainRightDrawerVue,
      }
    }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFoundVue,
  },
];

export default routes;
