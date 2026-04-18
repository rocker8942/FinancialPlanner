import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

// Lazy load all route components for code splitting
const HomeView = () => import('../views/HomeView.vue');
const CoverView = () => import('../views/CoverView.vue');
const LoginView = () => import('../views/LoginView.vue');
const RegisterView = () => import('../views/RegisterView.vue');
const ProfileView = () => import('../views/ProfileView.vue');
const PlansView = () => import('../views/PlansView.vue');
const ProgressView = () => import('../views/ProgressView.vue');
const SettingsView = () => import('../views/SettingsView.vue');
const McpView = () => import('../views/McpView.vue');

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Cover', component: CoverView },
  { path: '/retirementplanner', name: 'Home', component: HomeView },
  { path: '/:locale(au|kr)/retirementplanner', name: 'HomeLocale', component: HomeView },
  { path: '/:locale(au|kr)', redirect: to => `/${to.params.locale}/retirementplanner` },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/profile', name: 'Profile', component: ProfileView },
  { path: '/plans', name: 'Plans', component: PlansView },
  { path: '/progress', name: 'Progress', component: ProgressView },
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/mcp', name: 'MCP', component: McpView }
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
