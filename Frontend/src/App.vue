
<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans flex">
    <!-- Sidebar: left navigation -->
    <aside :class="['bg-gray-800 flex flex-col justify-between min-h-screen shadow-lg transition-all duration-300', sidebarCollapsed ? 'w-16' : 'w-64']">
      <div>
        <!-- App Title & Menu -->
        <div class="flex items-center gap-2 px-6 py-6 border-b border-gray-700">
          <button @click="toggleSidebar" class="toggle-button material-icons" aria-label="Toggle sidebar">
            {{ sidebarCollapsed ? 'menu' : 'menu_open' }}
          </button>
          <span v-show="!sidebarCollapsed" class="text-2xl font-bold text-teal-300 transition-opacity duration-300">FP</span>
        </div>
        <!-- Navigation -->
        <nav class="flex flex-col gap-1 mt-4 px-2">
          <span v-show="!sidebarCollapsed" class="uppercase text-xs text-gray-500 px-4 mb-2 transition-opacity duration-300">Main</span>
          <router-link to="/" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Dashboard' : ''">
            <span class="material-icons text-lg text-blue-400">trending_up</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Retirement Planner</span>
          </router-link>
          <!-- <router-link to="/progress" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Progress' : ''">
            <span class="material-icons text-lg text-green-400">trending_up</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Progress</span>
          </router-link>
          <router-link to="/plans" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Plans' : ''">
            <span class="material-icons text-lg text-yellow-400">event_note</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Plans</span>
          </router-link>
          <router-link to="/profile" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Profile' : ''">
            <span class="material-icons text-lg text-purple-400">account_circle</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Profile</span>
          </router-link>
          <router-link to="/settings" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Settings' : ''">
            <span class="material-icons text-lg">settings</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Settings</span>
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/login" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Login' : ''">
            <span class="material-icons text-lg">login</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Login</span>
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/register" :class="['flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400', sidebarCollapsed ? 'justify-center' : '']" :title="sidebarCollapsed ? 'Register' : ''">
            <span class="material-icons text-lg">person_add</span>
            <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Register</span>
          </router-link> -->
        </nav>
      </div>
      <!-- User Actions -->
      <!-- <div :class="['flex flex-col gap-4 px-6 pb-6 border-t border-gray-700', sidebarCollapsed ? 'items-center' : '']">
        <div :class="['flex gap-2', sidebarCollapsed ? 'flex-col items-center' : 'items-center']">
          <span class="material-icons text-2xl text-gray-400 cursor-pointer hover:text-teal-300" :title="sidebarCollapsed ? 'Notifications' : ''">notifications</span>
          <span class="material-icons text-2xl text-gray-400 cursor-pointer hover:text-teal-300" :title="sidebarCollapsed ? 'User' : ''">person</span>
        </div>
        <div v-show="!sidebarCollapsed" class="flex flex-col gap-1 text-xs text-gray-500 transition-opacity duration-300">
          <span class="cursor-pointer hover:text-gray-300">Help Center</span>
          <span class="cursor-pointer hover:text-gray-300">Support</span>
        </div>
      </div> -->
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col items-center justify-start">
      <main class="w-full p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sidebarCollapsed = ref(true); // Start collapsed by default

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}
</script>

<style scoped>
.toggle-button {
  background: transparent;
  border: none;
  color: #9ca3af; /* text-gray-400 */
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
  color: #6ee7b7; /* text-teal-300 */
  background-color: #374151; /* bg-gray-700 */
}

.toggle-button:active {
  background-color: #4b5563; /* bg-gray-600 */
  transform: scale(0.95);
}

.toggle-button:focus {
  outline: 2px solid #6ee7b7;
  outline-offset: 2px;
}
</style>

