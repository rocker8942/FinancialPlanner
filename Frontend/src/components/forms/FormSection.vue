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

const props = defineProps<Props>();

const emit = defineEmits<{
  'toggle': [sectionKey: string];
}>();

const toggleSection = () => {
  emit('toggle', props.sectionKey);
};
</script>

<style scoped>
.form-section {
  border: 1px solid #374151;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  padding: 1rem 1rem 0.5rem 1rem;
  background: #20232e;
  transition: all 0.2s ease;
}

.form-section.section-active {
  border-color: #6ee7b7;
  box-shadow: 0 0 0 1px rgba(110, 231, 183, 0.1);
}

.form-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6ee7b7;
  margin-bottom: 0.7rem;
  padding: 0 0.5rem;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.form-section-title.clickable:hover {
  background: #232733;
}

.chevron {
  display: inline-block;
  margin-right: 0.5em;
  transition: transform 0.2s;
  transform: rotate(-90deg);
}

.chevron.open {
  transform: rotate(0deg);
}
</style>