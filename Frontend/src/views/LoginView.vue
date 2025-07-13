<template>
  <div class="login-view">
    <h2>Login</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../services/api';

const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();

async function login() {
  error.value = '';
  try {
    await loginUser(email.value, password.value);
    router.push('/');
  } catch (e: any) {
    error.value = e.message || 'Login failed';
  }
}
</script>
