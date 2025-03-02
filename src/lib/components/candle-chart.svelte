<script lang="ts">
	import * as echarts from 'echarts';
	import { onMount, onDestroy } from 'svelte';
	import type { CandleData } from '$lib/types/market';

	interface CandleProps {
		data: CandleData[];
		theme: 'light' | 'dark';
		chartId: string;
	}

	let { data = $bindable(), theme = 'light', chartId = 'myChart' }: CandleProps = $props();

	let chart: echarts.ECharts | null = null;
	let chartContainer: HTMLDivElement;
	let resizeObserver: ResizeObserver;

	// Reverse the data arrays for display (oldest to newest)
	let dates = $derived([...data].reverse().map((item: CandleData) => item.date));
	let values = $derived(
		[...data].reverse().map((item: CandleData) => [item.open, item.close, item.low, item.high])
	);

	let series: echarts.CandlestickSeriesOption[] = $derived([
		{
			type: 'candlestick',
			name: 'Price',
			data: values,
			itemStyle: {
				color: '#0CF49B',
				color0: '#FD1050',
				borderColor: '#0CF49B',
				borderColor0: '#FD1050'
			}
		}
	]);

	let options: echarts.EChartsOption = $derived({
		animation: true,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				animation: false,
				type: 'cross',
				lineStyle: {
					color: '#376df4',
					width: 2,
					opacity: 1
				}
			}
		},
		xAxis: {
			type: 'category',
			data: dates,
			axisLine: { lineStyle: { color: '#8392A5' } }
		},
		yAxis: {
			scale: true,
			axisLine: { lineStyle: { color: '#8392A5' } },
			splitLine: { show: false }
		},
		grid: {
			bottom: 80,
			left: 40,
			right: 40,
			top: 40,
			containLabel: true
		},
		dataZoom: [
			{
				type: 'slider',
				show: true,
				xAxisIndex: [0],
				start: 0,
				end: 100,
				textStyle: {
					color: '#8392A5'
				},
				handleIcon:
					'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
				dataBackground: {
					areaStyle: {
						color: '#8392A5'
					},
					lineStyle: {
						opacity: 0.8,
						color: '#8392A5'
					}
				}
			},
			{
				type: 'inside',
				xAxisIndex: [0],
				start: 0,
				end: 100
			}
		],
		series
	});

	function initChart() {
		if (!chartContainer) return;

		// Dispose of existing chart if it exists
		if (chart) {
			chart.dispose();
		}

		chart = echarts.init(chartContainer, theme);
		chart.setOption(options);
	}

	function handleResize() {
		if (chart) {
			chart.resize();
		}
	}

	onMount(() => {
		initChart();

		// Set up the resize observer
		resizeObserver = new ResizeObserver(() => {
			handleResize();
		});

		resizeObserver.observe(chartContainer);
	});

	onDestroy(() => {
		// Clean up the resize observer
		if (resizeObserver) {
			resizeObserver.disconnect();
		}

		// Dispose of the chart
		if (chart) {
			chart.dispose();
			chart = null;
		}
	});

	$effect(() => {
		if (chart) {
			chart.setOption(options);
		}
	});
</script>

<div bind:this={chartContainer} id={chartId} class="candle-chart-container h-full w-full"></div>
