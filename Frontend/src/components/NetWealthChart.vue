<template>
  <div ref="chartContainer" class="w-full">
    <div ref="chart" style="width: 100%; height: 600px;"></div>
    
    <!-- Data Table -->
    <div class="mt-6">
      <h3 class="table-title">Financial Projection Data</h3>
      <div class="table-container">
        <table class="data-table">
          <thead class="table-header">
            <tr>
              <th class="table-cell-header">Age</th>
              <th class="table-cell-header text-right">Net Financial Assets</th>
              <th class="table-cell-header text-right">Superannuation</th>
              <th class="table-cell-header text-right">Total Income</th>
              <th class="table-cell-header text-right">Expenses</th>
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
              <td class="table-cell text-right">{{ formatCurrency(Math.max(0, item.savings)) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(item.superannuationBalance) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(item.totalIncome) }}</td>
              <td class="table-cell text-right">{{ formatCurrency(item.expenses) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { formatCurrency } from '../utils/formatters';

const props = defineProps<{ 
  projection: Array<{ 
    age: number; 
    wealth: number; 
    propertyAssets: number; 
    savings: number; 
    superannuationBalance: number;
    pensionIncome: number; // Updated to match backend response
    totalIncome: number;
    expenses: number;
  }> 
}>();
const chart = ref<HTMLDivElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let currentLegendSelection: Record<string, boolean> = {
  'Property Assets': false,
  'Financial Assets': true,
  'Pension Income': true
};

function renderChart() {
  if (!chart.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
    
    // Listen for legend selection changes
    chartInstance.on('legendselectchanged', (params: any) => {
      currentLegendSelection = { ...params.selected };
    });
  }

  // Prepare pension income data
  const pensionIncome = props.projection.map(_p => _p.pensionIncome ?? 0);
  // Use only savings (superannuation already included in savings from financialPlan.ts)
  const savingsData = props.projection.map(p => Math.max(0, p.savings));
  // Savings minus pension portion (for stacking, ensure non-negative)
  const nonPensionSavings = props.projection.map((_, i) => Math.max(0, savingsData[i] - pensionIncome[i]));

  chartInstance.setOption({
    tooltip: { 
      trigger: 'axis',
      formatter: (params: any) => {
        const dataPoint = params[0];
        const age = dataPoint.axisValue;
        const projectionData = props.projection.find(p => p.age === parseInt(age));
        if (projectionData) {
          return `
            Age: ${age}<br/>
            Property Assets: ${formatCurrency(projectionData.propertyAssets)}<br/>
            Net Financial Asset: ${formatCurrency(Math.max(0, projectionData.savings))}<br/>
            Superannuation: ${formatCurrency(projectionData.superannuationBalance)}<br/>
            Pension Income: ${formatCurrency(projectionData.pensionIncome ?? 0)}
          `;
        }
        return `Age: ${age}<br/>Net Wealth: ${formatCurrency(dataPoint.value)}`;
      }
    },
    legend: {
      data: ['Property Assets', 'Financial Assets', 'Pension Income'],
      top: 10,
      selected: currentLegendSelection
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
        data: props.projection.map(p => p.propertyAssets),
        type: 'line',
        smooth: true,
        areaStyle: {},
        stack: 'assets',
        color: '#8b5cf6'
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
        color: '#06b6d4'
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
    chartInstance.resize();
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
  
  // Also listen for window resize
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', handleResize);
});

watch(() => props.projection, renderChart, { deep: true });
</script>

<style scoped>
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
</style>
