<template>
  <div ref="chart" style="width: 100%; height: 400px;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{ projection: Array<{ age: number; wealth: number }> }>();
const chart = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

function renderChart() {
  if (!chart.value) return;
  if (!chartInstance) chartInstance = echarts.init(chart.value);
  chartInstance.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: props.projection.map(p => p.age) },
    yAxis: { type: 'value' },
    series: [{
      data: props.projection.map(p => p.wealth),
      type: 'line',
      smooth: true,
      areaStyle: {},
      name: 'Net Wealth'
    }]
  });
}

onMounted(renderChart);
watch(() => props.projection, renderChart, { deep: true });
</script>
