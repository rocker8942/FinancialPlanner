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
import { ref, computed } from 'vue';

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

const formattedValue = computed(() => props.formatValue(props.value));

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const parsedValue = props.parseValue(target.value);
  emit('update:value', parsedValue);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', props.fieldId, event);
};

const handleBlur = () => {
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