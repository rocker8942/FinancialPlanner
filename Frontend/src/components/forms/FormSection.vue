<template>
  <div class="form-section" :class="{ 'section-active': isOpen }">
    <button type="button" class="form-section-header" :aria-expanded="isOpen" @click="toggleSection">
      <span class="section-title">{{ title }}</span>
      <svg class="chevron-icon" :class="{ open: isOpen }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    <div v-show="isOpen" class="section-content">
      <slot />
    </div>
  </div>
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
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 0.625rem;
  padding: 0;
  background: var(--bg-card);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-section.section-active {
  border-color: var(--accent-text);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
}

.form-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  color: var(--text-secondary);
  transition: color 0.15s ease, background-color 0.15s ease;
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid transparent;
  /* button reset */
  background: transparent;
  border-top: none;
  border-left: none;
  border-right: none;
  font: inherit;
  text-align: left;
}

.form-section.section-active .form-section-header {
  color: var(--accent-text);
  border-bottom-color: var(--border-color);
}

.form-section-header:hover {
  background-color: var(--hover-bg);
  color: var(--accent-text);
}

.section-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.6;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease;
}

.form-section.section-active .chevron-icon,
.form-section-header:hover .chevron-icon {
  opacity: 1;
}

.chevron-icon.open {
  transform: rotate(180deg);
}

.section-content {
  padding: 1rem;
}
</style>