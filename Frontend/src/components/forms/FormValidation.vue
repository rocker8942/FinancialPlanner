<template>
  <div v-if="showValidation && isValid" class="field-validation-icon valid">
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>
  </div>
  <small v-if="!isValid && isTouched && errorMessage" class="validation-error">{{ errorMessage }}</small>
</template>

<script setup lang="ts">
interface Props {
  isValid: boolean;
  isTouched: boolean;
  errorMessage?: string;
  showValidation?: boolean;
}

withDefaults(defineProps<Props>(), {
  showValidation: true
});
</script>