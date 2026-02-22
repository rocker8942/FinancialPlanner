<template>
  <div class="form-group">
    <label v-if="label" :for="fieldId">{{ label }}</label>
    <div 
      class="input-with-buttons" 
      :class="{ 
        'input-valid': isValid, 
        'input-invalid': !isValid && isTouched 
      }"
    >
      <button 
        type="button" 
        class="increment-btn" 
        @mousedown="startContinuousAdjustment(-incrementStep)" 
        @mouseup="stopContinuousAdjustment" 
        @mouseleave="stopContinuousAdjustment" 
        @click="adjustValue(-incrementStep)"
      >
        -
      </button>
      <input 
        :id="fieldId"
        :value="formattedValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
        type="text" 
        :placeholder="placeholder"
        :required="required"
      />
      <button 
        type="button" 
        class="increment-btn" 
        @mousedown="startContinuousAdjustment(incrementStep)" 
        @mouseup="stopContinuousAdjustment" 
        @mouseleave="stopContinuousAdjustment" 
        @click="adjustValue(incrementStep)"
      >
        +
      </button>
      <div v-if="isValid && showValidation" class="field-validation-icon valid">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
    </div>
    <small v-if="helpText" class="help-text">{{ helpText }}</small>
    <small v-if="!isValid && isTouched && errorMessage" class="validation-error">{{ errorMessage }}</small>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  fieldId: string;
  label?: string;
  value: number;
  placeholder?: string;
  helpText?: string;
  errorMessage?: string;
  incrementStep?: number;
  required?: boolean;
  isValid?: boolean;
  isTouched?: boolean;
  showValidation?: boolean;
  formatValue?: (value: number) => string;
  parseValue?: (value: string) => number;
}

const props = withDefaults(defineProps<Props>(), {
  incrementStep: 1,
  required: true,
  isValid: true,
  isTouched: false,
  showValidation: true,
  formatValue: (value: number) => value.toString(),
  parseValue: (value: string) => parseFloat(value.replace(/,/g, '')) || 0
});

const emit = defineEmits<{
  'update:value': [value: number];
  'focus': [fieldId: string, event: FocusEvent];
  'blur': [fieldId: string];
  'enter': [event: KeyboardEvent];
  'adjust': [fieldId: string, adjustment: number];
}>();

const continuousAdjustmentTimer = ref<NodeJS.Timeout | null>(null);
const isAdjusting = ref(false);
const isFocused = ref(false);
// Raw text the user is typing — only used while the input is focused
const localText = ref('');

// While typing: show the raw text. When blurred: show the formatted value.
const formattedValue = computed(() =>
  isFocused.value ? localText.value : props.formatValue(props.value)
);

// Keep localText in sync when the value changes from outside (e.g. +/- buttons)
watch(() => props.value, (newVal) => {
  if (!isFocused.value) return;
  localText.value = String(newVal);
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  localText.value = target.value;
  // Emit raw number without clamping so typing isn't interrupted
  const raw = parseFloat(target.value.replace(/[,$%\s]/g, ''));
  emit('update:value', isNaN(raw) ? 0 : raw);
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  // Show raw number so the user can edit it freely
  localText.value = String(props.value);
  emit('focus', props.fieldId, event);
};

const handleBlur = () => {
  isFocused.value = false;
  // Apply proper clamping/formatting only when the user finishes typing
  const clamped = props.parseValue(localText.value);
  emit('update:value', clamped);
  emit('blur', props.fieldId);
};

const handleEnter = (event: KeyboardEvent) => {
  emit('enter', event);
};

const adjustValue = (adjustment: number) => {
  const newValue = Math.max(0, props.value + adjustment);
  emit('update:value', newValue);
  emit('adjust', props.fieldId, adjustment);
};

const startContinuousAdjustment = (adjustment: number) => {
  if (isAdjusting.value) return;
  
  isAdjusting.value = true;
  continuousAdjustmentTimer.value = setTimeout(() => {
    if (isAdjusting.value) {
      adjustValue(adjustment);
      startContinuousAdjustment(adjustment);
    }
  }, 150);
};

const stopContinuousAdjustment = () => {
  isAdjusting.value = false;
  if (continuousAdjustmentTimer.value) {
    clearTimeout(continuousAdjustmentTimer.value);
    continuousAdjustmentTimer.value = null;
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  color: #6ee7b7;
  font-weight: 500;
  font-size: 0.75rem;
}

.input-with-buttons {
  display: flex;
  align-items: center;
  gap: 0;
  position: relative;
}

.input-with-buttons input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #374151;
  border-left: none;
  border-right: none;
  background: #1f2937;
  color: #e0e3e8;
  font-size: 0.85rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  outline: none;
  min-width: 0;
}

.input-with-buttons input:focus {
  border-color: #6ee7b7;
  box-shadow: 0 0 0 2px rgba(110, 231, 183, 0.2);
}

.input-with-buttons.input-valid input {
  border-color: #34d399;
}

.input-with-buttons.input-invalid input {
  border-color: #ef4444;
}

.input-with-buttons input:disabled {
  background: #2d3748;
  color: #e0e3e8;
  cursor: not-allowed;
  border-color: #4a5568;
}

.field-validation-icon {
  position: absolute;
  right: 2.5rem;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

.field-validation-icon svg {
  width: 1rem;
  height: 1rem;
}

.field-validation-icon.valid {
  color: #34d399;
}

.increment-btn {
  width: 32px;
  height: 38px;
  background: #374151;
  border: 1px solid #374151;
  color: #e0e3e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  transition: background-color 0.2s;
  user-select: none;
  flex-shrink: 0;
  border-radius: 0;
  padding: 0;
}

.increment-btn:first-child {
  border-radius: 6px 0 0 6px;
}

.increment-btn:last-of-type {
  border-radius: 0 6px 6px 0;
}

.increment-btn:hover {
  background: #4b5563;
}

.increment-btn:active {
  background: #6b7280;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #9ca3af;
  line-height: 1.4;
}

.validation-error {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #ef4444;
  line-height: 1.3;
}

@media (max-width: 640px) {
  .increment-btn {
    width: 40px;
    height: 44px;
    font-size: 1rem;
  }

  .input-with-buttons input {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .form-group label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .increment-btn {
    width: 32px;
    height: 36px;
    font-size: 0.9rem;
    flex-shrink: 0;
  }

  .input-with-buttons {
    max-width: 100%;
    min-width: 0;
  }

  .input-with-buttons input {
    padding: 0.625rem 0.375rem;
    font-size: 0.85rem;
    flex: 1;
  }

  .form-group label {
    font-size: 0.75rem;
    margin-bottom: 0.375rem;
  }
}
</style>