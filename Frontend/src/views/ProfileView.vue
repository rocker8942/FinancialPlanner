<template>
  <div class="profile-view">
    <h2>Profile & Settings</h2>
    <form @submit.prevent="updateProfile">
      <input v-model="name" type="text" placeholder="Name" />
      <button type="submit">Update</button>
    </form>
    <button @click="logout">Logout</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getProfile, updateProfile as updateUserProfile, logoutUser } from '../services/api';

const name = ref('');
const router = useRouter();

async function fetchProfile() {
  const profile = await getProfile();
  name.value = profile?.name || '';
}

async function updateProfile() {
  await updateUserProfile({ name: name.value });
}

function logout() {
  logoutUser();
  router.push('/login');
}

fetchProfile();
</script>
