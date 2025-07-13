<template>
  <div class="register-view">
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      <input v-model="name" type="text" placeholder="Name (optional)" />
      <button type="submit">Register</button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../services/api';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const name = ref('');
const error = ref('');
const router = useRouter();

async function register() {
  error.value = '';
  try {
    await registerUser(email.value, password.value, confirmPassword.value, name.value);
    router.push('/login');
  } catch (e: any) {
    error.value = e.message || 'Registration failed';
  }
}
</script>
