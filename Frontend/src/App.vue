
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
          <span v-show="!sidebarCollapsed" :class="['uppercase text-xs px-4 mb-2 transition-opacity duration-300', isDark ? 'text-gray-500' : 'text-slate-400']">Main</span>
          <router-link to="/" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Home' : ''">
            <span class="material-icons text-lg text-green-400">home</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Home</span>
          </router-link>
          <router-link to="/retirementplanner" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Retirement Planner' : ''">
            <span class="material-icons text-lg text-blue-400">trending_up</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Retirement Planner</span>
          </router-link>
        </nav>
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
            Have questions or feedback?
            <a href="mailto:help@moneystock.net" class="text-teal-500 hover:text-teal-600 underline ml-1">
              Contact us
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
            <span :class="['uppercase text-xs px-4 mb-2', isDark ? 'text-gray-500' : 'text-slate-400']">Main</span>
            <router-link to="/" @click="closeMobileMenu" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700']">
              <span class="material-icons text-lg text-green-400">home</span>
              <span>Home</span>
            </router-link>
            <router-link to="/retirementplanner" @click="closeMobileMenu" :class="['flex items-center gap-2 px-4 py-2 rounded transition-colors', isDark ? 'hover:bg-gray-700 hover:text-teal-300 text-gray-100' : 'hover:bg-slate-100 hover:text-teal-600 text-slate-700']">
              <span class="material-icons text-lg text-blue-400">trending_up</span>
              <span>Retirement Planner</span>
            </router-link>
          </nav>
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from './composables/useTheme';

const { isDark, toggleTheme } = useTheme();

const sidebarCollapsed = ref(true); // Start collapsed by default
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
