<template>
  <div ref="chartContainer" style="width: 100%; height: 600px;">
    <div ref="chart" style="width: 100%; height: 100%;"></div>
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
    financialAssets: number; 
    pensionIncome: number; // Updated to match backend response
  }> 
}>();
const chart = ref<HTMLDivElement | null>(null);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

function renderChart() {
  if (!chart.value) return;
  if (!chartInstance) {
    chartInstance = echarts.init(chart.value);
  }

  // Prepare pension income data
  const pensionIncome = props.projection.map(p => p.pensionIncome ?? 0);
  const financialAssets = props.projection.map(p => p.financialAssets);
  // Financial assets minus pension portion (for stacking)
  const nonPensionFinancialAssets = props.projection.map((p, i) => financialAssets[i] - pensionIncome[i]);

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
            Total Wealth: ${formatCurrency(projectionData.wealth)}<br/>
            Property Assets: ${formatCurrency(projectionData.propertyAssets)}<br/>
            Financial Assets: ${formatCurrency(projectionData.financialAssets)}<br/>
            Pension Income: ${formatCurrency(projectionData.pensionIncome ?? 0)}
          `;
        }
        return `Age: ${age}<br/>Net Wealth: ${formatCurrency(dataPoint.value)}`;
      }
    },
    legend: {
      data: ['Property Assets', 'Financial Assets', 'Pension Income', 'Total Wealth'],
      top: 10,
      selected: {
        'Property Assets': false,
        'Total Wealth': false,
        'Financial Assets': true,
        'Pension Income': true
      }
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
        // Only show when Financial Assets is selected
        // (handled by stacking and legend selection)
      },
      {
        name: 'Financial Assets',
        data: nonPensionFinancialAssets,
        type: 'line',
        smooth: true,
        areaStyle: {},
        stack: 'assets',
        color: '#06b6d4'
      },
      {
        name: 'Total Wealth',
        data: props.projection.map(p => p.wealth),
        type: 'line',
        smooth: true,
        lineStyle: { width: 3 },
        color: '#6ee7b7'
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
