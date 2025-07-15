
<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 font-sans flex">
    <!-- Sidebar: left navigation -->
    <aside class="w-64 bg-gray-800 flex flex-col justify-between min-h-screen shadow-lg">
      <div>
        <!-- App Title & Menu -->
        <div class="flex items-center gap-2 px-6 py-6 border-b border-gray-700">
          <span class="material-icons text-3xl text-gray-400">menu</span>
          <span class="text-2xl font-bold text-teal-300">Financial Planner</span>
        </div>
        <!-- Navigation -->
        <nav class="flex flex-col gap-1 mt-4 px-2">
          <span class="uppercase text-xs text-gray-500 px-4 mb-2">Main</span>
          <router-link to="/" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100">
            <span class="material-icons text-lg text-blue-400">dashboard</span>
            Dashboard
          </router-link>
          <router-link to="/progress" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100">
            <span class="material-icons text-lg text-green-400">trending_up</span>
            Progress
          </router-link>
          <router-link to="/plans" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100">
            <span class="material-icons text-lg text-yellow-400">event_note</span>
            Plans
          </router-link>
          <router-link to="/profile" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100">
            <span class="material-icons text-lg text-purple-400">account_circle</span>
            Profile
          </router-link>
          <router-link to="/settings" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100">
            <span class="material-icons text-lg">settings</span>
            Settings
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/login" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400">
            <span class="material-icons text-lg">login</span>
            Login
          </router-link>
          <router-link v-if="!auth.isAuthenticated" to="/register" class="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400">
            <span class="material-icons text-lg">person_add</span>
            Register
          </router-link>
        </nav>
      </div>
      <!-- User Actions -->
      <div class="flex flex-col gap-4 px-6 pb-6 border-t border-gray-700">
        <div class="flex items-center gap-2">
          <span class="material-icons text-2xl text-gray-400">notifications</span>
          <span class="material-icons text-2xl text-gray-400">person</span>
        </div>
        <div class="flex flex-col gap-1 text-xs text-gray-500">
          <span>Help Center</span>
          <span>Support</span>
        </div>
      </div>
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
import { useAuthStore } from './store/auth';
const auth = useAuthStore();
</script>


