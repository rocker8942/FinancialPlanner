<template>
  <div ref="chartContainer" class="w-full">
    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="chart-title">
        <h3>{{ $t('chart.title') }}</h3>
        <div class="chart-toggle-group">
          <button
            class="chart-toggle"
            :class="{ active: !showInflationAdjusted }"
            @click="emit('update:showInflationAdjusted', false)"
          >
            {{ $t('chart.nominal_toggle') }}
          </button>
          <button
            class="chart-toggle"
            :class="{ active: showInflationAdjusted }"
            @click="emit('update:showInflationAdjusted', true)"
          >
            {{ $t('chart.real_toggle') }}
          </button>
        </div>
      </div>
      <div class="chart-info">
        <div class="info-item">
          <span class="info-label">View:</span>
          <span class="info-value">{{ showInflationAdjusted ? $t('chart.inflation_adjusted') : $t('chart.nominal') }} Values</span>
        </div>
        <div class="info-item">
          <span class="info-label">{{ $t('chart.currency') }}</span>
          <span class="info-value">{{ $t('chart.currency_value') }}</span>
        </div>
      </div>
    </div>
    
    <div ref="chart" class="chart-container"></div>
    
    <!-- Data Table -->
    <div class="mt-6">
      <h3 class="table-title">{{ $t('chart.table_title') }}</h3>
      <div class="table-container">
        <table class="data-table">
          <thead class="table-header">
            <tr>
              <th class="table-cell-header">{{ $t('chart.age') }}</th>
              <th class="table-cell-header text-right">{{ $t('chart.income') }}</th>
              <th class="table-cell-header text-right">{{ $t('chart.expenses') }}</th>
              <th class="table-cell-header text-right hidden-mobile">{{ $t('chart.mortgage') }}</th>
              <th class="table-cell-header text-right">{{ $t('chart.super') }}</th>
              <th class="table-cell-header text-right hidden-mobile">{{ $t('chart.savings') }}</th>
              <th class="table-cell-header text-right">{{ $t('chart.net_assets') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="(item, index) in projection" 
              :key="item.age"
              :class="index % 2 === 0 ? 'table-row-even' : 'table-row-odd'"
              class="table-row"
            >
              <td class="table-cell">{{ item.age }}</td>
              <td class="table-cell text-right">{{ fmt(getDisplayValue(item.totalIncome, item.age)) }}</td>
              <td class="table-cell text-right">{{ fmt(getDisplayValue(item.expenses, item.age)) }}</td>
              <td class="table-cell text-right hidden-mobile">{{ fmt(getDisplayValue(item.mortgageBalance, item.age)) }}</td>
              <td class="table-cell text-right">{{ fmt(getDisplayValue(item.superannuationBalance, item.age)) }}</td>
              <td class="table-cell text-right hidden-mobile">{{ fmt(getDisplayValue(item.rawSavings, item.age)) }}</td>
              <td class="table-cell text-right">{{ fmt(showInflationAdjusted && item.inflationAdjustedSavings !== undefined ? item.inflationAdjustedSavings : item.savings) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '../store/locale';
import { useTheme } from '../composables/useTheme';
// Tree-shaken ECharts imports - only load what we need
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// Register only the components we need
echarts.use([
  TooltipComponent,
  LegendComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  LineChart,
  CanvasRenderer
]);
import { formatCurrency } from '../utils/formatters';
import type { LifeEvent, HousePurchasePlan } from '../utils/models/FinancialTypes';

const props = defineProps<{
  projection: Array<{
    age: number;
    wealth: number;
    propertyAssets: number;
    savings: number;
    rawSavings: number;
    superannuationBalance: number;
    mortgageBalance: number;
    pensionIncome: number; // Updated to match backend response
    totalIncome: number;
    expenses: number;
    inflationAdjustedWealth?: number;
    inflationAdjustedPropertyAssets?: number;
    inflationAdjustedSavings?: number;
  }>;
  currentAge?: number;
  retirementAge?: number;
  cpiGrowthRate?: number;
  showInflationAdjusted: boolean;
  lifeEvents?: LifeEvent[];
  housePurchasePlan?: HousePurchasePlan;
}>();
const emit = defineEmits<{ 'update:showInflationAdjusted': [value: boolean] }>();
const { t } = useI18n();
const localeStore = useLocaleStore();
const fmt = (value: number) => formatCurrency(value, localeStore.locale);
const { isDark } = useTheme();
const chartLegendColor = computed(() => isDark.value ? '#e0e3e8' : '#374151');
const chartInactiveColor = computed(() => isDark.value ? '#6b7280' : '#94a3b8');
const chart = ref<HTMLDivElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
// Internal selection state — keys track which series are visible
const legendSelectionState = { property: false, financial: true, pension: true, lifeEvents: false };

function getLegendSelection(): Record<string, boolean> {
  return {
    [t('chart.property_legend')]: legendSelectionState.property,
    [t('chart.financial_legend')]: legendSelectionState.financial,
    [t('chart.pension_legend')]: legendSelectionState.pension,
    [t('chart.life_events_legend')]: legendSelectionState.lifeEvents
  };
}

function inflationFactor(age: number): number {
  if (!props.currentAge || !props.cpiGrowthRate) return 1;
  return Math.pow(1 + props.cpiGrowthRate, -(age - props.currentAge));
}

function getDisplayValue(value: number, age: number): number {
  if (!props.showInflationAdjusted) return value;
  return value * inflationFactor(age);
}

function renderChart() {
  if (!chart.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
    
    // Listen for legend selection changes
    chartInstance.on('legendselectchanged', (params: any) => {
      const sel = params.selected as Record<string, boolean>;
      legendSelectionState.property = sel[t('chart.property_legend')] ?? legendSelectionState.property;
      legendSelectionState.financial = sel[t('chart.financial_legend')] ?? legendSelectionState.financial;
      legendSelectionState.pension = sel[t('chart.pension_legend')] ?? legendSelectionState.pension;
      legendSelectionState.lifeEvents = sel[t('chart.life_events_legend')] ?? legendSelectionState.lifeEvents;
    });
  }

  // Prepare data based on inflation adjustment toggle
  const useInflationAdjusted = props.showInflationAdjusted;
  
  // Get property assets data
  const propertyData = props.projection.map(p => 
    useInflationAdjusted && p.inflationAdjustedPropertyAssets !== undefined 
      ? p.inflationAdjustedPropertyAssets 
      : p.propertyAssets
  );
  
  // Prepare pension income data (inflation-adjusted if toggled)
  const pensionIncome = props.projection.map((p) => {
    const basePension = p.pensionIncome ?? 0;
    return useInflationAdjusted ? basePension * inflationFactor(p.age) : basePension;
  });
  
  // Use savings data (inflation-adjusted if toggled)
  const savingsData = props.projection.map(p =>
    useInflationAdjusted && p.inflationAdjustedSavings !== undefined
      ? p.inflationAdjustedSavings
      : p.savings
  );
  
  // Build life event mark points for the Financial Assets series
  const lifeEventMarkPoints = (props.lifeEvents || []).map(event => {
    const projIndex = props.projection.findIndex(p => p.age === event.age);
    if (projIndex === -1) return null;
    const savingsValue = savingsData[projIndex];
    const yValue = savingsValue;
    return {
      name: event.label || (event.type === 'income' ? 'Income' : 'Expense'),
      coord: [projIndex, yValue],
      symbol: 'circle',
      symbolSize: 12,
      itemStyle: { color: event.type === 'income' ? '#10b981' : '#ef4444' },
      label: { show: false }
    };
  }).filter(Boolean);

  // Create milestone markers
  const milestones = [];
  if (props.retirementAge) {
    milestones.push({
      name: 'Retirement',
      xAxis: String(props.retirementAge),
      lineStyle: { color: '#fbbf24', width: 2, type: 'dashed' },
        label: { 
          show: true, 
          position: 'insideEndTop',
          formatter: `${t('chart.retirement_marker')}\nAge ${props.retirementAge}`,
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: 'bold'
      }
    });
  }
  
  milestones.push({
    name: 'Age Pension Eligibility',
    xAxis: '67',
    lineStyle: { color: '#34d399', width: 2, type: 'dashed' },
    label: {
      show: true,
      position: 'insideEndTop',
      formatter: t('chart.pension_marker'),
      color: '#34d399',
      fontSize: 12,
      fontWeight: 'bold'
    }
  });

  if (props.housePurchasePlan?.enabled) {
    const purchaseAge = props.housePurchasePlan.purchaseAge;
    if (props.projection.some(p => p.age === purchaseAge)) {
      milestones.push({
        name: 'House Purchase',
        xAxis: String(purchaseAge),
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        label: {
          show: true,
          position: 'insideEndTop',
          formatter: t('chart.house_marker', { age: purchaseAge }),
          color: '#f59e0b',
          fontSize: 12,
          fontWeight: 'bold'
        }
      });
    }
  }

  chartInstance.setOption({
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const dataPoint = params[0];
        const age = dataPoint.axisValue;
        const projectionData = props.projection.find(p => p.age === parseInt(age));
        if (projectionData) {
          const factor = useInflationAdjusted ? inflationFactor(projectionData.age) : 1;
          const propertyValue = useInflationAdjusted && projectionData.inflationAdjustedPropertyAssets !== undefined
            ? projectionData.inflationAdjustedPropertyAssets
            : projectionData.propertyAssets;
          const savingsValue = useInflationAdjusted && projectionData.inflationAdjustedSavings !== undefined
            ? projectionData.inflationAdjustedSavings
            : projectionData.savings;
          const superValue = projectionData.superannuationBalance * factor;
          const pensionValue = (projectionData.pensionIncome ?? 0) * factor;
          
          const valueType = useInflationAdjusted ? ' (Real Value)' : ' (Nominal)';

          const ageInt = parseInt(age);
          const eventsAtAge = (props.lifeEvents || []).filter(e => e.age === ageInt);
          const eventsHtml = eventsAtAge.map(e =>
            `<br/><span style="color:${e.type === 'income' ? '#10b981' : '#ef4444'}">${e.type === 'income' ? '▲' : '▼'} ${e.label || (e.type === 'income' ? 'Income' : 'Expense')}: ${fmt(e.amount)}</span>`
          ).join('');

          return `
            Age: ${age}<br/>
            Property Assets${valueType}: ${fmt(propertyValue)}<br/>
            Net Financial Asset${valueType}: ${fmt(savingsValue)}<br/>
            Superannuation${valueType}: ${fmt(superValue)}<br/>
            Pension Income${valueType}: ${fmt(pensionValue)}${eventsHtml}
          `;
        }
        return `Age: ${age}<br/>Net Wealth: ${fmt(dataPoint.value)}`;
      }
    },
    legend: {
      data: [t('chart.property_legend'), t('chart.financial_legend'), t('chart.pension_legend'), t('chart.life_events_legend')],
      top: 10,
      selected: getLegendSelection(),
      textStyle: {
        color: chartLegendColor.value
      },
      inactiveColor: chartInactiveColor.value,
      selectedMode: true
    },
    xAxis: { 
      type: 'category', 
      data: props.projection.map(p => String(p.age)),
      name: 'Age'
    },
    yAxis: { 
      type: 'value',
      name: 'Net Wealth',
      axisLabel: {
        formatter: (value: number) => fmt(value)
      }
    },
    series: [
      {
        name: t('chart.property_legend'),
        data: propertyData,
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {},
        stack: 'assets',
        color: '#8b5cf6'
      },
      {
        name: t('chart.pension_legend'),
        data: pensionIncome,
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {},
        color: '#fde68a',
        emphasis: { focus: 'series' },
      },
      {
        name: t('chart.financial_legend'),
        data: savingsData,
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: {},
        stack: 'assets',
        color: '#06b6d4',
        markPoint: {
          data: lifeEventMarkPoints,
          tooltip: { show: false }
        }
      },
      {
        name: t('chart.life_events_legend'),
        data: props.projection.map(() => null),
        type: 'line',
        showSymbol: false,
        color: '#f59e0b',
        markLine: {
          silent: true,
          data: milestones
        }
      }
    ]
  });

  // Ensure chart resizes properly
  if (chartInstance) {
    chartInstance.resize();
  }
}

function handleResize() {
  if (chartInstance) {
    // Use a small delay to ensure the container has finished resizing
    setTimeout(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    }, 100);
  }
}

onMounted(() => {
  renderChart();
  
  // Add resize observer to handle container size changes
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      if (chartInstance) {
        chartInstance.resize();
      }
    });
    resizeObserver.observe(chartContainer.value);
  }
  
  // Also listen for window resize and orientation change
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', () => {
    // Delay resize on orientation change for mobile devices
    setTimeout(handleResize, 300);
  });
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('orientationchange', handleResize);
});

watch(() => props.projection, renderChart, { deep: true });
watch(() => props.showInflationAdjusted, renderChart);
watch(isDark, renderChart);
watch(() => localeStore.locale, renderChart);
</script>

<style scoped>
/* Chart Controls Styles */
.chart-controls {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.chart-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.chart-title h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--accent-text);
  margin: 0;
}

.chart-toggle-group {
  display: flex;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.chart-toggle {
  padding: 0.4rem 0.875rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.chart-toggle:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.chart-toggle.active {
  background: var(--accent-text);
  color: #fff;
  font-weight: 600;
}

.chart-toggle:not(:last-child) {
  border-right: 1px solid var(--border-color);
}

.chart-info {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* Chart Container Responsive Heights */
.chart-container {
  width: 100%;
  height: 600px;
  min-height: 400px;
}

@media (max-width: 768px) {
  .chart-controls {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .chart-title {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    gap: 0.75rem;
  }
  
  .chart-title h3 {
    font-size: 1rem;
  }
  
  .chart-container {
    height: 400px;
    min-height: 300px;
  }
  
  .chart-toggle-group {
    width: 100%;
  }
  
  .chart-toggle {
    flex: 1;
    text-align: center;
    padding: 0.35rem 0.75rem;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .chart-controls {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .chart-title {
    margin-bottom: 0.4rem;
    gap: 0.5rem;
  }
  
  .chart-title h3 {
    font-size: 0.9rem;
  }
  
  .chart-container {
    height: 300px;
    min-height: 250px;
  }
  
  .chart-toggle {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .chart-toggle-group {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .chart-toggle:not(:last-child) {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}

.table-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--accent-text);
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
}

.table-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.data-table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.table-header {
  background: var(--bg-card-alt);
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-cell-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: var(--accent-text);
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background: var(--hover-bg) !important;
}

.table-row-even {
  background: var(--bg-card);
}

.table-row-odd {
  background: var(--bg-card-alt);
}

.table-cell {
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.table-container {
  max-height: 24rem;
  overflow-y: auto;
}

/* Custom scrollbar */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: var(--bg-card-alt);
}

.table-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: var(--border-input);
}

/* Mobile table optimizations */
@media (max-width: 768px) {
  .hidden-mobile {
    display: none;
  }
  
  .table-container {
    max-height: 16rem; /* Reduce height on mobile */
  }
  
  .data-table {
    font-size: 0.75rem;
  }
  
  .table-cell-header,
  .table-cell {
    padding: 0.5rem 0.75rem;
  }
  
  .table-title {
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
  }
}

@media (max-width: 480px) {
  .table-container {
    max-height: 12rem;
  }
  
  .data-table {
    font-size: 0.7rem;
  }
  
  .table-cell-header,
  .table-cell {
    padding: 0.4rem 0.5rem;
  }
}
</style>
