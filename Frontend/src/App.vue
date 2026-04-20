
<template>
  <div :class="['min-h-screen font-sans flex max-w-full overflow-hidden', isDark ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-slate-900']">
    <!-- Sidebar: left navigation -->
    <aside :class="['flex flex-col justify-between min-h-screen shadow-lg transition-all duration-300', 'hidden md:flex', sidebarCollapsed ? 'w-16' : 'w-64', isDark ? 'bg-gray-800' : 'bg-white border-r border-slate-200']">
      <div>
        <!-- App Title & Menu -->
        <div :class="['flex items-center gap-2 px-3 py-4 border-b', isDark ? 'border-gray-700' : 'border-slate-200', sidebarCollapsed ? 'justify-center' : 'justify-between']">
          <div class="flex items-center gap-2">
            <button @click="toggleSidebar" :class="['toggle-button material-icons', isDark ? '' : 'toggle-button-light']" aria-label="Toggle sidebar">
              {{ sidebarCollapsed ? 'menu' : 'menu_open' }}
            </button>
            <div v-show="!sidebarCollapsed" class="app-title-container">
              <span class="text-2xl font-bold text-teal-500 transition-opacity duration-300">FP</span>
              <span class="beta-badge-sidebar">β</span>
            </div>
          </div>
          <button
            @click="toggleTheme"
            :class="['toggle-button material-icons', isDark ? '' : 'toggle-button-light']"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >{{ isDark ? 'light_mode' : 'dark_mode' }}</button>
        </div>
        <!-- Navigation -->
        <nav class="flex flex-col gap-1 mt-4 px-2">
           <span v-show="!sidebarCollapsed" :class="['uppercase text-xs px-4 mb-2 transition-opacity duration-300', isDark ? 'text-gray-500' : 'text-slate-400']">{{ $t('nav.main') }}</span>
          <router-link :to="currentLocale === 'kr' ? '/kr' : '/'" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? $t('nav.home') : ''">
            <span class="material-icons text-lg text-green-400">home</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">{{ $t('nav.home') }}</span>
          </router-link>
          <router-link :to="currentLocale === 'kr' ? '/kr/retirementplanner' : '/retirementplanner'" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? $t('nav.planner') : ''">
            <span class="material-icons text-lg text-blue-400">trending_up</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">{{ $t('nav.planner') }}</span>
          </router-link>
          <router-link v-if="currentLocale !== 'kr'" to="/mcp" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? $t('nav.mcp') : ''">
            <span class="material-icons text-lg text-cyan-400">hub</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">{{ $t('nav.mcp') }}</span>
          </router-link>
        </nav>

        <!-- Country / Locale Switcher -->
        <div :class="['locale-switcher px-2 mt-4', sidebarCollapsed ? 'collapsed' : '']">
          <span v-show="!sidebarCollapsed" :class="['uppercase text-xs px-2 mb-2 block transition-opacity duration-300', isDark ? 'text-gray-500' : 'text-slate-400']">Region</span>
          <div :class="['locale-pills', sidebarCollapsed ? 'flex-col' : 'flex-row', isDark ? 'bg-gray-700' : 'bg-slate-100']">
            <button @click="switchLocale('au')" :class="['locale-pill', currentLocale === 'au' ? 'locale-pill-active' : (isDark ? 'locale-pill-inactive-dark' : 'locale-pill-inactive')]" title="Australia">
              <span v-show="sidebarCollapsed" class="flag">🇦🇺</span>
              <span v-show="!sidebarCollapsed" class="locale-label">Australia</span>
            </button>
            <button @click="switchLocale('kr')" :class="['locale-pill', currentLocale === 'kr' ? 'locale-pill-active' : (isDark ? 'locale-pill-inactive-dark' : 'locale-pill-inactive')]" title="Korea">
              <span v-show="sidebarCollapsed"class="flag">🇰🇷</span>
              <span v-show="!sidebarCollapsed" class="locale-label">한국</span>
            </button>
          </div>
        </div>
      </div>

    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col max-w-full overflow-hidden">
      <!-- Mobile menu toggle -->
      <div :class="['md:hidden flex items-center justify-between px-4 py-3 border-b max-w-full', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200 shadow-sm']">
        <div class="flex items-center gap-2">
          <span class="text-xl font-bold text-teal-500">FP</span>
          <span class="beta-badge-mobile">β</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="toggleTheme"
            :class="['toggle-button material-icons', isDark ? '' : 'toggle-button-light']"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >{{ isDark ? 'light_mode' : 'dark_mode' }}</button>
          <button @click="toggleMobileMenu" :class="['toggle-button material-icons', isDark ? '' : 'toggle-button-light']" aria-label="Toggle menu">
            menu
          </button>
        </div>
      </div>

      <main class="flex-1 p-4 md:p-8 max-w-full overflow-hidden">
        <router-view />
      </main>

      <!-- Footer -->
      <footer :class="['border-t py-4 px-4 md:px-8 max-w-full overflow-hidden', isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200']">
        <div class="flex justify-center">
          <p :class="['text-sm text-center', isDark ? 'text-gray-400' : 'text-slate-500']">
            {{ $t('nav.feedback') }}
            <a href="https://github.com/rocker8942/FinancialPlanner/issues" class="text-teal-500 hover:text-teal-600 underline ml-1">
              {{ $t('nav.submit_issue') }}
            </a>
          </p>
        </div>
      </footer>
    </div>

    <!-- Mobile menu overlay -->
    <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" @click="closeMobileMenu">
      <aside :class="['w-64 h-full shadow-lg flex flex-col justify-between', isDark ? 'bg-gray-800' : 'bg-white']" @click.stop>
        <div>
          <!-- Mobile App Title & Close -->
          <div :class="['flex items-center justify-between px-6 py-6 border-b', isDark ? 'border-gray-700' : 'border-slate-200']">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-teal-500">FP</span>
              <span class="beta-badge-sidebar">β</span>
            </div>
            <button @click="closeMobileMenu" :class="['toggle-button material-icons', isDark ? '' : 'toggle-button-light']" aria-label="Close menu">
              close
            </button>
          </div>
          <!-- Mobile Navigation -->
          <nav class="flex flex-col gap-1 mt-4 px-2">
            <span :class="['uppercase text-xs px-4 mb-2', isDark ? 'text-gray-500' : 'text-slate-400']">{{ $t('nav.main') }}</span>
            <router-link :to="currentLocale === 'kr' ? '/kr' : '/'" @click="closeMobileMenu" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700']">
              <span class="material-icons text-lg text-green-400">home</span>
              <span>{{ $t('nav.home') }}</span>
            </router-link>
            <router-link :to="currentLocale === 'kr' ? '/kr/retirementplanner' : '/retirementplanner'" @click="closeMobileMenu" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700']">
              <span class="material-icons text-lg text-blue-400">trending_up</span>
              <span>{{ $t('nav.planner') }}</span>
            </router-link>
            <router-link v-if="currentLocale !== 'kr'" to="/mcp" @click="closeMobileMenu" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700']">
              <span class="material-icons text-lg text-cyan-400">hub</span>
              <span>{{ $t('nav.mcp') }}</span>
            </router-link>
          </nav>

          <!-- Mobile Country Switcher -->
          <div class="px-4 mt-6 mb-4">
            <span :class="['uppercase text-xs mb-2 block', isDark ? 'text-gray-500' : 'text-slate-400']">Region</span>
            <div :class="['locale-pills flex-row', isDark ? 'bg-gray-700' : 'bg-slate-100']">
              <button @click="switchLocale('au'); closeMobileMenu()" :class="['locale-pill flex-1', currentLocale === 'au' ? 'locale-pill-active' : (isDark ? 'locale-pill-inactive-dark' : 'locale-pill-inactive')]">
                <span class="flag">🇦🇺</span>
                <span class="locale-label">Australia</span>
              </button>
              <button @click="switchLocale('kr'); closeMobileMenu()" :class="['locale-pill flex-1', currentLocale === 'kr' ? 'locale-pill-active' : (isDark ? 'locale-pill-inactive-dark' : 'locale-pill-inactive')]">
                <span class="flag">🇰🇷</span>
                <span class="locale-label">한국</span>
              </button>
            </div>
          </div>
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useTheme } from './composables/useTheme';

const { isDark, toggleTheme } = useTheme();
const { locale } = useI18n();
const route = useRoute();
const router = useRouter();

// Sync route locale param or meta → i18n locale
watch(() => [route.params.locale, route.meta.locale], ([paramLocale, metaLocale]) => {
  const resolved = paramLocale ?? metaLocale;
  locale.value = resolved === 'kr' ? 'ko-KR' : 'en-AU';
  document.documentElement.lang = resolved === 'kr' ? 'ko' : 'en';
}, { immediate: true });

const currentLocale = computed<'au' | 'kr'>(() => {
  const p = route.params.locale ?? route.meta.locale;
  return p === 'kr' ? 'kr' : 'au';
});

function switchLocale(target: 'au' | 'kr') {
  const name = route.name as string | undefined;
  if (target === 'kr') {
    if (name === 'HomeLocale' || name === 'Home') router.push('/kr/retirementplanner');
    else router.push('/kr');
  } else {
    if (name === 'HomeLocale' || name === 'Home') router.push('/retirementplanner');
    else router.push('/');
  }
}

const sidebarCollapsed = ref(true);
const mobileMenuOpen = ref(false);

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}
</script>

<style scoped>
.toggle-button {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 0;
}

.toggle-button:hover {
  color: #6ee7b7;
  background-color: #374151;
}

.toggle-button:active {
  background-color: #4b5563;
  transform: scale(0.95);
}

.toggle-button:focus {
  outline: 2px solid #6ee7b7;
  outline-offset: 2px;
}

/* Light mode overrides for toggle button */
.toggle-button-light {
  color: #64748b;
}

.toggle-button-light:hover {
  color: #0d9488;
  background-color: #f1f5f9;
}

.toggle-button-light:active {
  background-color: #e2e8f0;
}

.toggle-button-light:focus {
  outline-color: #0d9488;
}

.app-title-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.3s;
}

.beta-badge-sidebar {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.beta-badge-mobile {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 0.75rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* ── Locale Switcher ───────────────────────────────────────── */
.locale-switcher {
  margin-top: 0.5rem;
}

.locale-pills {
  display: flex;
  gap: 0.25rem;
  border-radius: 0.625rem;
  padding: 0.25rem;
}

.locale-pills.flex-col {
  flex-direction: column;
}

.locale-pills.flex-row {
  flex-direction: row;
}

.locale-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.4rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.locale-pill-active {
  background: linear-gradient(135deg, #14b8a6 0%, #059669 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.35);
}

.locale-pill-inactive {
  background: transparent;
  color: #64748b;
}

.locale-pill-inactive:hover {
  background: #e2e8f0;
  color: #0d9488;
}

.locale-pill-inactive-dark {
  background: transparent;
  color: #9ca3af;
}

.locale-pill-inactive-dark:hover {
  background: #374151;
  color: #6ee7b7;
}

.flag {
  font-size: 1rem;
  line-height: 1;
}

.locale-label {
  font-size: 0.8125rem;
}

/* Hide Settings menu on iPhone and narrow mobile screens */
@media (max-width: 414px) {
  .hidden-on-iphone {
    display: none !important;
  }

  /* Center main content on iPhone */
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0.5rem !important;
  }
}
</style>
