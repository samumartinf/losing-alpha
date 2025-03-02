<script lang="ts">
	import CandleChart from './candle-chart.svelte';
	import { ToggleGroup, ToggleGroupItem } from '@/lib/components/ui/toggle-group';
	import type { TimeSeriesData, CandleData } from '$lib/types/market';

	type TimeRange = {
		value: string;
		label: string;
		interval?: string; // Corresponding interval for the API
	};

	interface TimeSeriesChartProps {
		timeSeriesData: TimeSeriesData;
		title?: string;
		chartId: string;
		theme?: 'light' | 'dark';
		onTimeRangeChange?: (range: string, interval: string) => Promise<void>;
	}

	const timeRanges: TimeRange[] = [
		{ value: '1D', label: '1D', interval: '1m' },
		{ value: '1W', label: '1W', interval: '15m' },
		{ value: '3M', label: '3M', interval: '1h' },
		{ value: '1Y', label: '1Y', interval: '1d' },
		{ value: '5Y', label: '5Y', interval: '1w' },
		{ value: 'MAX', label: 'MAX', interval: '1w' }
	];

	let { 
		timeSeriesData = $bindable({
			symbol: '',
			interval: '1d',
			candles: [],
			lastUpdated: 0
		}), 
		title = $bindable(''), 
		chartId = $bindable(''), 
		theme = $bindable('light'),
		onTimeRangeChange = $bindable(async (range: string, interval: string) => {})
	}: TimeSeriesChartProps = $props();

	let selectedTimeRange = $state('1Y');
	let displayData = $state<CandleData[]>([]);
	let loading = $state(false);

	// Function to adjust data points based on time range
	function adjustDataPoints(data: TimeSeriesData): CandleData[] {
		if (!data.candles.length) return [];
		
		// Determine how many data points to show based on time range
		let pointsToShow: number;
		switch (selectedTimeRange) {
			case '1D':
				pointsToShow = 24 * 60; // Show minute data for 1D
				break;
			case '1W':
				pointsToShow = 7 * 24 * 4; // Show 15min data for a week
				break;
			case '3M':
				pointsToShow = 90 * 24; // Show hourly data for 3 months
				break;
			case '1Y':
				pointsToShow = 365; // Show daily data for a year
				break;
			case '5Y':
				pointsToShow = 5 * 52; // Show weekly data for 5 years
				break;
			case 'MAX':
				return data.candles; // Show all data
			default:
				pointsToShow = data.candles.length;
		}
		
		// If we have fewer points than requested, return all data
		if (data.candles.length <= pointsToShow) return data.candles;
		
		// Otherwise, sample the data to get the requested number of points
		return data.candles.slice(-pointsToShow);
	}

	async function handleTimeRangeChange(range: string) {
		if (range === selectedTimeRange) return;
		
		const newRange = timeRanges.find(r => r.value === range);
		if (!newRange) return;

		loading = true;
		selectedTimeRange = range;
		try {
			await onTimeRangeChange(range, newRange.interval || '1d');
		} finally {
			loading = false;
		}
	}

	// Update display data whenever the time series data changes or time range changes
	$effect(() => {
		displayData = adjustDataPoints(timeSeriesData);
	});

	// Derive title if not provided
	$effect(() => {
		if (!title) {
			title = `${timeSeriesData.symbol} - ${timeSeriesData.interval}`;
		}
	});
</script>

<div class="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-lg w-full h-full">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
		<div class="flex flex-col">
			<h3 class="text-lg font-medium">{title}</h3>
			<p class="text-sm text-muted-foreground">
				Last updated: {new Date(timeSeriesData.lastUpdated).toLocaleString()}
			</p>
		</div>
		<div class="w-full sm:w-auto overflow-x-auto">
			<ToggleGroup 
				type="single" 
				value={selectedTimeRange} 
				onValueChange={handleTimeRangeChange} 
				variant="outline"
				size="sm"
				class="flex-nowrap"
			>
				{#each timeRanges as range}
					<ToggleGroupItem value={range.value} class="px-2 sm:px-3">{range.label}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>
	</div>
	
	{#if displayData.length > 0}
		<div class="flex-1 min-h-[250px]">
			{#if loading}
				<div class="flex-1 flex items-center justify-center h-full">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{:else}
				<CandleChart 
					data={displayData} 
					theme={theme} 
					chartId={chartId} 
				/>
			{/if}
		</div>
	{:else}
		<div class="flex-1 flex items-center justify-center min-h-[250px]">
			{#if loading}
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			{:else}
				<p class="text-gray-500">No data available</p>
			{/if}
		</div>
	{/if}
</div> 