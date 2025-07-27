<template>
  <nav class="flex flex-col gap-1 mt-4 px-2">
    <span v-show="!sidebarCollapsed" class="uppercase text-xs text-gray-500 px-4 mb-2 transition-opacity duration-300">
      Main
    </span>
    
    <router-link 
      v-for="item in menuItems" 
      :key="item.path"
      :to="item.path"
      :class="[
        'flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-gray-100 transition-all duration-200',
        sidebarCollapsed ? 'justify-center' : ''
      ]"
      :title="sidebarCollapsed ? item.tooltip || item.label : ''"
    >
      <SidebarIcon 
        :name="item.icon.name" 
        :color="item.icon.color.replace('text-', '')"
      />
      <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">
        {{ item.label }}
      </span>
    </router-link>
    
    <!-- Authentication links -->
    <template v-if="!auth.isAuthenticated">
      <router-link 
        to="/login"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400',
          sidebarCollapsed ? 'justify-center' : ''
        ]"
        :title="sidebarCollapsed ? 'Login' : ''"
      >
        <SidebarIcon name="login" color="blue-400" />
        <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Login</span>
      </router-link>
      
      <router-link 
        to="/register"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 hover:text-teal-300 text-blue-400',
          sidebarCollapsed ? 'justify-center' : ''
        ]"
        :title="sidebarCollapsed ? 'Register' : ''"
      >
        <SidebarIcon name="person_add" color="blue-400" />
        <span v-show="!sidebarCollapsed" class="transition-opacity duration-300">Register</span>
      </router-link>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../store/auth';
import { menuItems } from '../config/menuIcons';
import SidebarIcon from './SidebarIcon.vue';

interface Props {
  sidebarCollapsed: boolean;
}

defineProps<Props>();

const auth = useAuthStore();
</script>