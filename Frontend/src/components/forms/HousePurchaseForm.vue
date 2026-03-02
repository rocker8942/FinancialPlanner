<template>
  <div class="house-purchase-form">
    <!-- Toggle -->
    <div class="toggle-row">
      <label class="toggle-label">
        <input
          type="checkbox"
          class="toggle-checkbox"
          :checked="modelValue.enabled"
          @change="update('enabled', ($event.target as HTMLInputElement).checked)"
        />
        <span class="toggle-text">I plan to buy a house</span>
      </label>
    </div>

    <!-- Detail fields (visible when enabled) -->
    <div v-if="modelValue.enabled" class="fields">
      <!-- Purchase Age -->
      <div class="field-row">
        <label class="field-label">Purchase age</label>
        <div class="field-input-wrap">
          <input
            class="field-input"
            type="number"
            :value="modelValue.purchaseAge"
            :min="currentAge + 1"
            :max="deathAge - 1"
            @change="update('purchaseAge', clampAge(Number(($event.target as HTMLInputElement).value)))"
          />
        </div>
      </div>

      <!-- Purchase Price -->
      <div class="field-row">
        <label class="field-label">Purchase price</label>
        <div class="field-input-wrap currency">
          <span class="currency-prefix">$</span>
          <input
            class="field-input"
            type="text"
            :value="isFocused === 'purchasePrice' ? rawText : formatAmount(modelValue.purchasePrice)"
            @focus="onFocus('purchasePrice', modelValue.purchasePrice)"
            @blur="onBlur('purchasePrice', ($event.target as HTMLInputElement).value)"
            @input="rawText = ($event.target as HTMLInputElement).value"
          />
        </div>
      </div>

      <!-- Down Payment % -->
      <div class="field-row">
        <label class="field-label">Down payment</label>
        <div class="field-input-wrap pct">
          <input
            class="field-input"
            type="number"
            :value="modelValue.downPaymentPercent"
            min="0"
            max="100"
            @change="update('downPaymentPercent', Math.min(100, Math.max(0, Number(($event.target as HTMLInputElement).value))))"
          />
          <span class="pct-suffix">%</span>
        </div>
      </div>

      <!-- Computed summary -->
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Down payment amount</span>
          <span class="summary-value">{{ formatCurrency(downPaymentAmount) }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Mortgage amount</span>
          <span class="summary-value">{{ formatCurrency(mortgageAmount) }}</span>
        </div>
      </div>

      <!-- Warning if down payment > savings (informational only) -->
      <p v-if="downPaymentAmount > 0" class="info-note">
        At age {{ modelValue.purchaseAge }}, {{ formatCurrency(downPaymentAmount) }} will be deducted from your savings as a down payment.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { HousePurchasePlan } from '../../utils/models/FinancialTypes';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps<{
  modelValue: HousePurchasePlan;
  currentAge: number;
  deathAge: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: HousePurchasePlan];
  'field-change': [field: string, value: any];
}>();

const isFocused = ref<string | null>(null);
const rawText = ref('');

const downPaymentAmount = computed(() =>
  props.modelValue.purchasePrice * (props.modelValue.downPaymentPercent / 100)
);

const mortgageAmount = computed(() =>
  props.modelValue.purchasePrice - downPaymentAmount.value
);

function formatAmount(amount: number): string {
  if (!amount) return '';
  return amount.toLocaleString('en-AU', { maximumFractionDigits: 0 });
}

function parseAmount(value: string): number {
  return Number(value.replace(/[^0-9.]/g, '')) || 0;
}

function clampAge(age: number): number {
  return Math.max(props.currentAge + 1, Math.min(props.deathAge - 1, age));
}

function update(field: keyof HousePurchasePlan, value: any): void {
  emit('update:modelValue', { ...props.modelValue, [field]: value });
  emit('field-change', field, value);
}

function onFocus(field: string, amount: number): void {
  isFocused.value = field;
  rawText.value = amount ? String(amount) : '';
}


function onBlur(_field: string, value: string): void {
  isFocused.value = null;
  update('purchasePrice', parseAmount(value));
}
</script>

<style scoped>
.house-purchase-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-row {
  display: flex;
  align-items: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.toggle-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: var(--accent-text);
  cursor: pointer;
}

.toggle-text {
  font-size: 0.85rem;
  color: var(--text-primary);
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.field-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 0.25rem;
  padding: 0 0.4rem;
}

.field-input-wrap:focus-within {
  border-color: var(--accent-text);
}

.field-input-wrap.currency {
  width: 8rem;
}

.field-input-wrap.pct {
  width: 5rem;
}

.currency-prefix,
.pct-suffix {
  font-size: 0.75rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.field-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.3rem 0.2rem;
  font-size: 0.8rem;
  width: 100%;
  min-width: 0;
}

.field-input:focus {
  outline: none;
}

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.summary {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.summary-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-text);
}

.info-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
  line-height: 1.4;
}
</style>
