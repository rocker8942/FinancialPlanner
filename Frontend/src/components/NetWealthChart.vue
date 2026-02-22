<template>
  <div ref="chartContainer" class="w-full">
    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="chart-title">
        <h3>Net Wealth Projection</h3>
        <div class="chart-toggle-group">
          <button
            class="chart-toggle"
            :class="{ active: !showInflationAdjusted }"
            @click="emit('update:showInflationAdjusted', false)"
          >
            Nominal Values
          </button>
          <button
            class="chart-toggle"
            :class="{ active: showInflationAdjusted }"
            @click="emit('update:showInflationAdjusted', true)"
          >
            Real Values (Today's Purchasing Power)
          </button>
        </div>
      </div>
      <div class="chart-info">
        <div class="info-item">
          <span class="info-label">View:</span>
          <span class="info-value">{{ showInflationAdjusted ? 'Inflation-Adjusted' : 'Nominal' }} Values</span>
        </div>
        <div class="info-item">
          <span class="info-label">Currency:</span>
          <span class="info-value">AUD</span>
        </div>
      </div>
    </div>
    
    <div ref="chart" class="chart-container"></div>
    
    <!-- Data Table -->
    <div class="mt-6">
      <h3 class="table-title">Financial Projection Data</h3>
      <div class="table-container">
        <table class="data-table">
          <thead class="table-header">
            <tr>
              <th class="table-cell-header">Age</th>
              <th class="table-cell-header text-right">Total Income</th>
              <th class="table-cell-header text-right">Expenses</th>
              <th class="table-cell-header text-right hidden-mobile">Mortgage</th>
              <th class="table-cell-header text-right">Superannuation</th>
              <th class="table-cell-header text-right hidden-mobile">Savings</th>
              <th class="table-cell-header text-right">Net Financial Assets</th>
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
              <td class="table-cell text-right">{{ formatCurrency(getDisplayValue(item.totalIncome, item.age)) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(getDisplayValue(item.expenses, item.age)) }}</td>
              <td class="table-cell text-right hidden-mobile">{{ formatCurrency(getDisplayValue(item.mortgageBalance, item.age)) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(getDisplayValue(item.superannuationBalance, item.age)) }}</td>
              <td class="table-cell text-right hidden-mobile">{{ formatCurrency(getDisplayValue(item.rawSavings, item.age)) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(Math.max(0, showInflationAdjusted && item.inflationAdjustedSavings !== undefined ? item.inflationAdjustedSavings : item.savings)) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue';
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
import type { LifeEvent } from '../utils/models/FinancialTypes';

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
}>();
const emit = defineEmits<{ 'update:showInflationAdjusted': [value: boolean] }>();
const chart = ref<HTMLDivElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let currentLegendSelection: Record<string, boolean> = {
  'Property Assets': false,
  'Financial Assets': true,
  'Pension Income': true
};

function getDisplayValue(value: number, age: number): number {
  if (!props.showInflationAdjusted || !props.currentAge || !props.cpiGrowthRate) {
    return value;
  }
  const yearsFromNow = age - props.currentAge;
  const inflationAdjustmentFactor = Math.pow(1 + props.cpiGrowthRate, -yearsFromNow);
  return value * inflationAdjustmentFactor;
}

function renderChart() {
  if (!chart.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
    
    // Listen for legend selection changes
    chartInstance.on('legendselectchanged', (params: any) => {
      currentLegendSelection = { ...params.selected };
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
    if (useInflationAdjusted && props.currentAge && props.cpiGrowthRate) {
      // Calculate years from current age
      const yearsFromNow = p.age - props.currentAge;
      // Apply inflation adjustment factor to show real purchasing power
      const inflationAdjustmentFactor = Math.pow(1 + props.cpiGrowthRate, -yearsFromNow);
      return basePension * inflationAdjustmentFactor;
    }
    return basePension;
  });
  
  // Use savings data (inflation-adjusted if toggled)
  const savingsData = props.projection.map(p => 
    Math.max(0, useInflationAdjusted && p.inflationAdjustedSavings !== undefined 
      ? p.inflationAdjustedSavings 
      : p.savings
    )
  );
  
  // Savings minus pension portion (for stacking, ensure non-negative)
  const nonPensionSavings = props.projection.map((_, i) => Math.max(0, savingsData[i] - pensionIncome[i]));

  // Build life event mark points for the Financial Assets series
  const lifeEventMarkPoints = (props.lifeEvents || []).map(event => {
    const projPoint = props.projection.find(p => p.age === event.age);
    if (!projPoint) return null;
    const yValue = Math.max(0, useInflationAdjusted && projPoint.inflationAdjustedSavings !== undefined
      ? projPoint.inflationAdjustedSavings
      : projPoint.savings);
    return {
      name: event.label || (event.type === 'income' ? 'Income' : 'Expense'),
      coord: [event.age, yValue],
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
      xAxis: props.retirementAge,
      lineStyle: { color: '#fbbf24', width: 2, type: 'dashed' },
      label: { 
        show: true, 
        position: 'insideEndTop',
        formatter: `Retirement\nAge ${props.retirementAge}`,
        color: '#fbbf24',
        fontSize: 12,
        fontWeight: 'bold'
      }
    });
  }
  
  milestones.push({
    name: 'Age Pension Eligibility',
    xAxis: 67,
    lineStyle: { color: '#34d399', width: 2, type: 'dashed' },
    label: { 
      show: true, 
      position: 'insideEndTop',
      formatter: 'Age Pension\nEligible (67)',
      color: '#34d399',
      fontSize: 12,
      fontWeight: 'bold'
    }
  });

  chartInstance.setOption({
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const dataPoint = params[0];
        const age = dataPoint.axisValue;
        const projectionData = props.projection.find(p => p.age === parseInt(age));
        if (projectionData) {
          const propertyValue = useInflationAdjusted && projectionData.inflationAdjustedPropertyAssets !== undefined 
            ? projectionData.inflationAdjustedPropertyAssets 
            : projectionData.propertyAssets;
          const savingsValue = useInflationAdjusted && projectionData.inflationAdjustedSavings !== undefined 
            ? projectionData.inflationAdjustedSavings 
            : projectionData.savings;
          
          // Calculate inflation-adjusted superannuation value for tooltip
          let superValue = projectionData.superannuationBalance;
          if (useInflationAdjusted && props.currentAge && props.cpiGrowthRate) {
            const yearsFromNow = projectionData.age - props.currentAge;
            const inflationAdjustmentFactor = Math.pow(1 + props.cpiGrowthRate, -yearsFromNow);
            superValue = projectionData.superannuationBalance * inflationAdjustmentFactor;
          }
          
          // Calculate inflation-adjusted pension income value for tooltip
          let pensionValue = projectionData.pensionIncome ?? 0;
          if (useInflationAdjusted && props.currentAge && props.cpiGrowthRate) {
            const yearsFromNow = projectionData.age - props.currentAge;
            const inflationAdjustmentFactor = Math.pow(1 + props.cpiGrowthRate, -yearsFromNow);
            pensionValue = (projectionData.pensionIncome ?? 0) * inflationAdjustmentFactor;
          }
          
          const valueType = useInflationAdjusted ? ' (Real Value)' : ' (Nominal)';

          const ageInt = parseInt(age);
          const eventsAtAge = (props.lifeEvents || []).filter(e => e.age === ageInt);
          const eventsHtml = eventsAtAge.map(e =>
            `<br/><span style="color:${e.type === 'income' ? '#10b981' : '#ef4444'}">${e.type === 'income' ? '▲' : '▼'} ${e.label || (e.type === 'income' ? 'Income' : 'Expense')}: ${formatCurrency(e.amount)}</span>`
          ).join('');

          return `
            Age: ${age}<br/>
            Property Assets${valueType}: ${formatCurrency(propertyValue)}<br/>
            Net Financial Asset${valueType}: ${formatCurrency(Math.max(0, savingsValue))}<br/>
            Superannuation${valueType}: ${formatCurrency(superValue)}<br/>
            Pension Income${valueType}: ${formatCurrency(pensionValue)}${eventsHtml}
          `;
        }
        return `Age: ${age}<br/>Net Wealth: ${formatCurrency(dataPoint.value)}`;
      }
    },
    legend: {
      data: ['Property Assets', 'Financial Assets', 'Pension Income'],
      top: 10,
      selected: currentLegendSelection,
      textStyle: {
        color: '#e0e3e8'
      },
      inactiveColor: '#6b7280',
      selectedMode: true
    },
    xAxis: { 
      type: 'category', 
      data: props.projection.map(p => p.age),
      name: 'Age'
    },
    yAxis: { 
      type: 'value',
      name: 'Net Wealth',
      axisLabel: {
        formatter: (value: number) => formatCurrency(value)
      }
    },
    series: [
      {
        name: 'Property Assets',
        data: propertyData,
        type: 'line',
        smooth: true,
        areaStyle: {},
        stack: 'assets',
        color: '#8b5cf6',
        markLine: {
          silent: true,
          data: milestones
        }
      },
      {
        name: 'Pension Income',
        data: pensionIncome,
        type: 'line',
        smooth: true,
        areaStyle: {},
        stack: 'assets',
        color: '#fde68a',
        emphasis: { focus: 'series' },
        // Only show when Savings is selected
        // (handled by stacking and legend selection)
      },
      {
        name: 'Financial Assets',
        data: nonPensionSavings,
        type: 'line',
        smooth: true,
        areaStyle: {},
        stack: 'assets',
        color: '#06b6d4',
        markPoint: {
          data: lifeEventMarkPoints,
          tooltip: { show: false }
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
</script>

<style scoped>
/* Chart Controls Styles */
.chart-controls {
  background: #232733;
  border: 1px solid #374151;
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
  color: #6ee7b7;
  margin: 0;
}

.chart-toggle-group {
  display: flex;
  background: #1f2937;
  border-radius: 8px;
  border: 1px solid #374151;
  overflow: hidden;
}

.chart-toggle {
  padding: 0.4rem 0.875rem;
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.chart-toggle:hover {
  background: #374151;
  color: #e0e3e8;
}

.chart-toggle.active {
  background: #6ee7b7;
  color: #1f2937;
  font-weight: 600;
}

.chart-toggle:not(:last-child) {
  border-right: 1px solid #374151;
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
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.875rem;
  color: #e0e3e8;
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
    border-bottom: 1px solid #374151;
  }
}

.table-title {
  font-size: 1rem;
  font-weight: 700;
  color: #6ee7b7;
  margin-bottom: 1rem;
  letter-spacing: 0.02em;
}

.table-container {
  background: #232733;
  border: 1px solid #374151;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.data-table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.table-header {
  background: #20232e;
  position: sticky;
  top: 0;
  z-index: 10;
}

.table-cell-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #6ee7b7;
  border-bottom: 1px solid #374151;
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background: #2a2d3a !important;
}

.table-row-even {
  background: #232733;
}

.table-row-odd {
  background: #20232e;
}

.table-cell {
  padding: 0.75rem 1rem;
  color: #f3f4f6;
  border-bottom: 1px solid #374151;
}

.table-container {
  max-height: 24rem;
  overflow-y: auto;
}

/* Custom scrollbar for dark theme */
.table-container::-webkit-scrollbar {
  width: 8px;
}

.table-container::-webkit-scrollbar-track {
  background: #20232e;
}

.table-container::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
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
