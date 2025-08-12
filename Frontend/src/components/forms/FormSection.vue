<template>
  <fieldset class="form-section" :class="{ 'section-active': isOpen }">
    <legend class="form-section-title clickable" @click="toggleSection">
      <span class="chevron" :class="{ open: isOpen }">&#9660;</span>
      {{ title }}
    </legend>
    <div v-show="isOpen">
      <slot />
    </div>
  </fieldset>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  isOpen: boolean;
  sectionKey: string;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle': [sectionKey: string];
}>();

const props = defineProps<Props>();

const toggleSection = () => {
  emit('toggle', props.sectionKey);
};
</script>