import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CoverView from '../views/CoverView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import ProfileView from '../views/ProfileView.vue';
import PlansView from '../views/PlansView.vue';
import ProgressView from '../views/ProgressView.vue';
import SettingsView from '../views/SettingsView.vue';
import { useAuthStore } from '../store/auth';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Cover', component: CoverView },
  { path: '/retirementplanner', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/profile', name: 'Profile', component: ProfileView },
  { path: '/plans', name: 'Plans', component: PlansView },
  { path: '/progress', name: 'Progress', component: ProgressView },
  { path: '/settings', name: 'Settings', component: SettingsView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

const protectedRoutes = ['Profile', 'Plans', 'Progress', 'Settings'];

router.beforeEach((to, _, next) => {
  const auth = useAuthStore();
  if (protectedRoutes.includes(to.name as string) && !auth.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
