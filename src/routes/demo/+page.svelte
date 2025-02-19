<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		fetchCryptoData,
		fetchStockData,
		fetchDailyOHLCV,
		fetchKrakenOHLCV,
		type AlphaVantageMatch,
		type AlphaVantageDailyResponse
	} from '$lib/utils/market';
	import type { MarketData } from '$lib/utils/market';
	import MarketCard from '$lib/components/market-card.svelte';
	import CandleChart from '$lib/components/candle-chart.svelte';
	import type { CandleData } from '$lib/types';
	import { Button } from '@/lib/components/ui/button';
	import TickerSelector from '@/lib/components/ticker-selector.svelte';
	import { ToggleGroup, ToggleGroupItem } from '@/lib/components/ui/toggle-group';

	let marketData = $state<MarketData[]>([]);
	let candleData = $state<CandleData[]>([]);
	let krakenCandleData = $state<CandleData[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let lineData = $state([150, 230, 224, 218, 135, 147, 260]);
	let selectedTicker = $state('');
	let selectedTimeRange = $state('1Y');
	let cryptoTicker = $state('BTCUSD');

	const cryptoCoins = ['bitcoin', 'ethereum', 'cardano', 'solana'];

	const timeRanges = [
		{ value: '1D', label: '1D' },
		{ value: '1W', label: '1W' },
		{ value: '3M', label: '3M' },
		{ value: '1Y', label: '1Y' },
		{ value: '5Y', label: '5Y' },
		{ value: 'MAX', label: 'MAX' }
	];

	// Add these functions for time range handling
	function getKrakenInterval(range: string): number {
		switch (range) {
			case '1D':
				return 1;  // 1 minute
			case '1W':
				return 15; // 15 minutes
			case '3M':
				return 60; // 1 hour
			case '1Y':
				return 240; // 4 hours
			case '5Y':
			case 'MAX':
				return 1440; // 1 day
			default:
				return 1440;
		}
	}

	function getTimestampFromTimeRange(range: string): number {
		const now = new Date();
		switch (range) {
			case '1D':
				return Math.floor(now.setDate(now.getDate() - 1) / 1000);
			case '1W':
				return Math.floor(now.setDate(now.getDate() - 7) / 1000);
			case '3M':
				return Math.floor(now.setMonth(now.getMonth() - 3) / 1000);
			case '1Y':
				return Math.floor(now.setFullYear(now.getFullYear() - 1) / 1000);
			case '5Y':
				return Math.floor(now.setFullYear(now.getFullYear() - 5) / 1000);
			case 'MAX':
				return 0; // Get all available data
			default:
				return Math.floor(now.setDate(now.getDate() - 1) / 1000);
		}
	}

	function getAlphaVantageInterval(range: string): string {
		switch (range) {
			case '1D':
				return '1min';
			case '1W':
				return '15min';
			case '3M':
				return '60min';
			case '1Y':
			case '5Y':
			case 'MAX':
				return 'daily';
			default:
				return 'daily';
		}
	}

	async function handleTimeRangeChange(range: string) {
		selectedTimeRange = range;
		if (selectedTicker) {
			await updateCandleChartData();
		}
		if (krakenCandleData.length > 0) {
			await fetchKrakenData();
		}
	}

	async function fetchAllMarketData() {
		try {
			loading = true;
			error = null;

			const [cryptoData, stockData] = await Promise.all([
				fetchCryptoData(cryptoCoins),
				fetchStockData('SPY')
			]);

			marketData = [...(stockData ? [stockData] : []), ...cryptoData];

		} catch (err) {
			console.error('Error fetching market data:', err);
			error = 'Failed to fetch market data. Please try again later.';
		} finally {
			loading = false;
		}
	}

	function transformCandleData(marketData: AlphaVantageDailyResponse, reverse: boolean = true): CandleData[] {
		const transformedData: CandleData[] = Object.entries(marketData['Time Series (Daily)']).map(([date, values]) => ({
			date,
			open: parseFloat(values['1. open']),
			high: parseFloat(values['2. high']),
			low: parseFloat(values['3. low']),
			close: parseFloat(values['4. close']),
			// volume: parseFloat(values['5. volume'])
		}));
		if (reverse) {
			transformedData.reverse();
		}
		return transformedData;
	}

	async function fetchKrakenData() {
		const interval = getKrakenInterval(selectedTimeRange);
		const since = getTimestampFromTimeRange(selectedTimeRange);
		const krakenData = await fetchKrakenOHLCV('XXBTZUSD', interval, since);
		if (!krakenData) {
			//TODO: Handle error
			return;
		}
		krakenCandleData = transformCandleData(krakenData, false);
	}

	async function updateCandleChartData() {
		const marketData = await fetchDailyOHLCV(selectedTicker);
		if (!marketData) {
			//TODO: Handle error
			return;
		}
		const transformedCandleData = transformCandleData(marketData);
		candleData = transformedCandleData;
	}

	function handleTickerSelect(ticker: AlphaVantageMatch) {
		selectedTicker = ticker['1. symbol'];
		console.log(selectedTicker);
	}

	// Refresh data every 60 seconds
	const interval = setInterval(fetchAllMarketData, 60000);

	// Fetch data on mount
	onMount(() => {
		fetchAllMarketData();
		fetchKrakenData();
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="container mx-auto p-4 space-y-6">
	<header class="flex flex-col gap-4">
		<h1 class="text-3xl font-bold">Market Overview</h1>
		<div class="flex flex-wrap gap-4 items-center">
			<div class="flex-1 min-w-[300px]">
				<TickerSelector onSelect={handleTickerSelect} />
			</div>
			<ToggleGroup type="single" value={selectedTimeRange} onValueChange={handleTimeRangeChange} variant="outline">
				{#each timeRanges as range}
					<ToggleGroupItem value={range.value}>{range.label}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
			<div class="flex gap-2">
				<Button variant="default" onclick={updateCandleChartData}>
					Update Chart
				</Button>
				<Button variant="outline" onclick={fetchKrakenData}>
					Fetch Kraken Data
				</Button>
			</div>
		</div>
	</header>

	{#if error}
		<div class="rounded-lg border-l-4 border-red-500 bg-red-100 p-4" role="alert">
			<div class="flex">
				<div class="flex-shrink-0">
					<!-- You can add an error icon here if you want -->
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Price Charts</h2>
		<div class="grid gap-4 lg:grid-cols-2">
			{#if candleData.length > 0}
				<div class="rounded-lg bg-white p-4 shadow-lg">
					<h3 class="mb-4 text-lg font-medium">{selectedTicker}</h3>
					<CandleChart 
						bind:data={candleData} 
						theme="light" 
						chartId="stockChart" 
					/>
				</div>
			{/if}
			
			{#if krakenCandleData.length > 0}
				<div class="rounded-lg bg-white p-4 shadow-lg">
					<h3 class="mb-4 text-lg font-medium">{cryptoTicker}</h3>
					<CandleChart 
						bind:data={krakenCandleData} 
						theme="light" 
						chartId="krakenChart" 
					/>
				</div>
			{/if}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-2xl font-semibold">Market Prices</h2>
		{#if loading && marketData.length === 0}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each Array(5) as _}
					<div class="h-32 animate-pulse rounded-lg bg-gray-200"></div>
				{/each}
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each marketData as data (data.symbol)}
					<MarketCard {data} />
				{/each}
			</div>
		{/if}
	</section>
</div>
