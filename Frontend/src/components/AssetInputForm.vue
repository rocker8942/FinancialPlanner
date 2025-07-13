<template>
  <form @submit.prevent="submit">
    <input v-model.number="assets" type="number" placeholder="Assets" required />
    <input v-model.number="salary" type="number" placeholder="Salary" required />
    <input v-model.number="expenses" type="number" placeholder="Expenses" required />
    <input v-model.number="currentAge" type="number" placeholder="Current Age" required />
    <input v-model.number="deathAge" type="number" placeholder="Death Age" required />
    <button type="submit">Update Plan</button>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getFinancialProfile, updateFinancialProfile } from '../services/api';

const emit = defineEmits(['update']);
const assets = ref(0);
const salary = ref(0);
const expenses = ref(0);
const currentAge = ref(30);
const deathAge = ref(90);

const LOCAL_KEY = 'financial-input';

function saveToLocalStorage() {
  const data = {
    assets: assets.value,
    salary: salary.value,
    expenses: expenses.value,
    currentAge: currentAge.value,
    deathAge: deathAge.value
  };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem(LOCAL_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      assets.value = parsed.assets ?? 0;
      salary.value = parsed.salary ?? 0;
      expenses.value = parsed.expenses ?? 0;
      currentAge.value = parsed.currentAge ?? 30;
      deathAge.value = parsed.deathAge ?? 90;
    } catch {}
  }
}

async function load() {
  loadFromLocalStorage();
  const profile = await getFinancialProfile();
  if (profile) {
    assets.value = profile.assets;
    salary.value = profile.salary;
    expenses.value = profile.expenses;
    currentAge.value = profile.currentAge;
    deathAge.value = profile.deathAge;
    saveToLocalStorage();
  }
}

async function submit() {
  await updateFinancialProfile({ assets: assets.value, salary: salary.value, expenses: expenses.value, currentAge: currentAge.value, deathAge: deathAge.value });
  saveToLocalStorage();
  emit('update');
}

onMounted(load);
</script>
