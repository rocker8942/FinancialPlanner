<template>
  <div class="life-events-form">
    <div v-if="modelValue.length > 0" class="events-list">
      <div v-for="event in sortedEvents" :key="event.id" class="event-card">
        <!-- Row 1: type toggle + label -->
        <div class="event-top">
          <button
            type="button"
            class="type-btn"
            :class="event.type"
            @click="toggleType(event.id)"
            :title="event.type === 'income' ? 'Income — click to switch to expense' : 'Expense — click to switch to income'"
          >
            {{ event.type === 'income' ? '+' : '−' }}
          </button>
          <input
            class="label-input"
            type="text"
            placeholder="e.g. Buy a car"
            :value="event.label"
            @input="updateField(event.id, 'label', ($event.target as HTMLInputElement).value)"
          />
        </div>
        <!-- Row 2: age + amount + delete -->
        <div class="event-bottom">
          <div class="age-field">
            <span class="field-prefix">Age</span>
            <input
              class="age-input"
              type="number"
              :value="event.age"
              :min="currentAge"
              :max="deathAge"
              @change="updateField(event.id, 'age', clampAge(Number(($event.target as HTMLInputElement).value)))"
            />
          </div>
          <div class="amount-field">
            <span class="field-prefix">$</span>
            <input
              class="amount-input"
              type="text"
              :value="focusedAmountId === event.id ? rawAmountText : formatAmount(event.amount)"
              @focus="onAmountFocus(event.id, event.amount)"
              @blur="onAmountBlur(event.id, ($event.target as HTMLInputElement).value)"
              @input="onAmountInput(($event.target as HTMLInputElement).value)"
            />
          </div>
          <button type="button" class="delete-btn" @click="removeEvent(event.id)" title="Remove">×</button>
        </div>
      </div>
    </div>

    <p v-else class="empty-state">
      Add lump sum events like buying a car, receiving an inheritance, home renovation, etc.
    </p>

    <button type="button" class="add-btn" @click="addEvent">+ Add Life Event</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { LifeEvent } from '../../utils/models/FinancialTypes';

const props = defineProps<{
  modelValue: LifeEvent[];
  currentAge: number;
  deathAge: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: LifeEvent[]];
}>();

const focusedAmountId = ref<string | null>(null);
const rawAmountText = ref('');

const sortedEvents = computed(() =>
  [...props.modelValue].sort((a, b) => a.age - b.age)
);

function formatAmount(amount: number): string {
  if (!amount) return '';
  return amount.toLocaleString('en-AU', { maximumFractionDigits: 0 });
}

function parseAmount(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return Number(cleaned) || 0;
}

function clampAge(age: number): number {
  return Math.max(props.currentAge, Math.min(props.deathAge, age));
}

function addEvent(): void {
  const defaultAge = clampAge(props.currentAge + 10);
  const newEvent: LifeEvent = {
    id: crypto.randomUUID(),
    label: '',
    age: defaultAge,
    amount: 0,
    type: 'expense'
  };
  emit('update:modelValue', [...props.modelValue, newEvent]);
}

function removeEvent(id: string): void {
  emit('update:modelValue', props.modelValue.filter(e => e.id !== id));
}

function toggleType(id: string): void {
  emit('update:modelValue', props.modelValue.map(e =>
    e.id === id ? { ...e, type: e.type === 'income' ? 'expense' : 'income' as const } : e
  ));
}

function updateField(id: string, field: keyof LifeEvent, value: any): void {
  emit('update:modelValue', props.modelValue.map(e =>
    e.id === id ? { ...e, [field]: value } : e
  ));
}

function onAmountFocus(id: string, amount: number): void {
  focusedAmountId.value = id;
  rawAmountText.value = amount ? String(amount) : '';
}

function onAmountInput(value: string): void {
  rawAmountText.value = value;
}

function onAmountBlur(id: string, value: string): void {
  focusedAmountId.value = null;
  updateField(id, 'amount', parseAmount(value));
}
</script>

<style scoped>
/* Force containment — fieldset ancestors don't constrain width without this */
.life-events-form {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow: hidden;
}

.events-list {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-card {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  padding: 0.4rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.event-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

/* indent bottom row to sit under the label, not the type button */
.event-bottom {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  padding-left: 1.75rem; /* type-btn(1.25rem) + gap(0.4rem) + 0.1rem buffer */
}

.type-btn {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.type-btn.income  { background: #065f46; color: #6ee7b7; }
.type-btn.income:hover  { background: #047857; }
.type-btn.expense { background: #7f1d1d; color: #fca5a5; }
.type-btn.expense:hover { background: #991b1b; }

.label-input {
  flex: 1;
  min-width: 0;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 0.25rem;
  color: var(--text-primary);
  padding: 0.3rem 0.4rem;
  font-size: 0.8rem;
}

.label-input::placeholder { color: var(--text-muted); }
.label-input:focus { outline: none; border-color: var(--accent-text); }

/* age: fixed narrow width; amount: grows to fill */
.age-field {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 0.25rem;
  padding: 0 0.3rem;
  flex-shrink: 0;
}

.amount-field {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: 0.25rem;
  padding: 0 0.3rem;
  width: 7rem;
  max-width: 7rem;
  flex-shrink: 0;
  overflow: hidden;
}

.age-field:focus-within,
.amount-field:focus-within { border-color: var(--accent-text); }

.field-prefix {
  font-size: 0.7rem;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.age-input {
  width: 2rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.3rem 0;
  font-size: 0.8rem;
  text-align: center;
}

.age-input:focus { outline: none; }
.age-input::-webkit-inner-spin-button,
.age-input::-webkit-outer-spin-button { -webkit-appearance: none; }

.amount-input {
  width: 100%;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
  padding: 0.3rem 0;
  font-size: 0.8rem;
  text-align: right;
}

.amount-input:focus { outline: none; }

.delete-btn {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  background: transparent;
  border: 1px solid var(--border-input);
  border-radius: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}

.delete-btn:hover {
  background: #7f1d1d;
  border-color: #ef4444;
  color: #fca5a5;
}

.empty-state {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
  padding: 0.4rem 0;
  margin: 0;
}

.add-btn {
  align-self: flex-start;
  background: var(--bg-card);
  border: 1px dashed var(--border-input);
  color: var(--text-secondary);
  padding: 0.35rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
}

.add-btn:hover {
  border-color: var(--accent-text);
  color: var(--accent-text);
  background: var(--hover-bg);
}
</style>
