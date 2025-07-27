<template>
  <span 
    :class="[
      'material-icons', 
      `text-${size}`, 
      `text-${color}`,
      'transition-colors duration-200'
    ]"
  >
    {{ name }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  size?: 'sm' | 'lg' | 'xl' | '2xl';
  color?: string;
}

withDefaults(defineProps<Props>(), {
  size: 'lg',
  color: 'gray-400'
});
</script>