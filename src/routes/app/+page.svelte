<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import {
		fetchCryptoData,
		fetchStockData,
		fetchDailyOHLCVStandardized,
		fetchKrakenOHLCVStandardized,
	} from '$lib/utils/market';
	import type { MarketData, TimeSeriesData, AlphaVantageMatch } from '$lib/types/market';
	import MarketCard from '$lib/components/market-card.svelte';
	import TimeSeriesChart from '$lib/components/time-series-chart.svelte';
	import { Button } from '@/lib/components/ui/button';
	import TickerSelector from '@/lib/components/ticker-selector.svelte';

	let marketData = $state<MarketData[]>([]);
	let stockTimeSeriesData = $state<TimeSeriesData>({
		symbol: '',
		interval: '1d',
		candles: [],
		lastUpdated: Date.now()
	});
	let cryptoTimeSeriesData = $state<TimeSeriesData>({
		symbol: 'BTCUSD',
		interval: '1d',
		candles: [],
		lastUpdated: Date.now()
	});
	let loading = $state(true);
	let error = $state<string | null>(null);
	let selectedTicker = $state('');
	let cryptoTicker = $state('BTCUSD');

	const cryptoCoins = ['bitcoin', 'ethereum', 'cardano', 'solana'];

	// Map time ranges to Kraken intervals (in minutes)
	const timeRangeToKrakenInterval: Record<string, number> = {
		'1D': 1,
		'1W': 15,
		'3M': 60,
		'1Y': 1440,
		'5Y': 10080,
		'MAX': 10080
	};

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

	async function handleStockTimeRangeChange(range: string, interval: string) {
		if (selectedTicker) {
			await updateCandleChartData();
		}
	}

	async function handleCryptoTimeRangeChange(range: string, interval: string) {
		await fetchKrakenData(range);
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

	async function fetchKrakenData(timeRange: string = '1Y') {
		try {
			const interval = timeRangeToKrakenInterval[timeRange] || 1440; // Default to daily
			const since = getTimestampFromTimeRange(timeRange);
			
			const data = await fetchKrakenOHLCVStandardized('XXBTZUSD', interval, since);
			if (!data) {
				throw new Error('Failed to fetch Kraken data');
			}
			
			cryptoTimeSeriesData = data;
		} catch (err) {
			console.error('Error fetching Kraken data:', err);
			error = 'Failed to fetch crypto data. Please try again later.';
		}
	}

	async function updateCandleChartData() {
		if (!selectedTicker) return;
		
		try {
			const data = await fetchDailyOHLCVStandardized(selectedTicker);
			if (!data) {
				throw new Error('Failed to fetch stock data');
			}
			console.log('Successfully fetched stock data', data);
			stockTimeSeriesData = data;
		} catch (err) {
			console.error('Error fetching stock data:', err);
			error = 'Failed to fetch stock data. Please try again later.';
		}
	}

	function handleTickerSelect(ticker: AlphaVantageMatch) {
		console.log('handleTickerSelect', ticker);
		selectedTicker = ticker['1. symbol'];
		updateCandleChartData();
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

<div class="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
	<header class="flex flex-col gap-4">
		<h1 class="text-2xl sm:text-3xl font-bold">Market Overview</h1>
		<div class="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
			<div class="w-full sm:w-auto sm:flex-1 min-w-[250px]">
				<TickerSelector onSelect={handleTickerSelect} />
			</div>
			<div class="flex gap-2">
				<Button variant="default" onclick={updateCandleChartData} disabled={!selectedTicker} class="whitespace-nowrap">
					Update Chart
				</Button>
				<Button variant="outline" onclick={() => fetchKrakenData('1Y')} class="whitespace-nowrap">
					Refresh Crypto
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
		<h2 class="text-xl sm:text-2xl font-semibold">Price Charts</h2>
		<div class="grid gap-6 lg:grid-cols-2 grid-cols-1">
			{#if stockTimeSeriesData.candles.length > 0}
				<div class="h-[350px] sm:h-[400px] md:h-[450px]">
					<TimeSeriesChart 
						timeSeriesData={stockTimeSeriesData}
						title={selectedTicker} 
						theme="light" 
						chartId="stockChart"
						onTimeRangeChange={handleStockTimeRangeChange}
					/>
				</div>
			{:else if selectedTicker}
				<div class="h-[350px] sm:h-[400px] md:h-[450px] flex items-center justify-center rounded-lg bg-white p-4 shadow-lg">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{/if}
			
			{#if cryptoTimeSeriesData.candles.length > 0}
				<div class="h-[350px] sm:h-[400px] md:h-[450px]">
					<TimeSeriesChart 
						timeSeriesData={cryptoTimeSeriesData}
						title={cryptoTicker} 
						theme="light" 
						chartId="krakenChart"
						onTimeRangeChange={handleCryptoTimeRangeChange}
					/>
				</div>
			{:else}
				<div class="h-[350px] sm:h-[400px] md:h-[450px] flex items-center justify-center rounded-lg bg-white p-4 shadow-lg">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
				</div>
			{/if}
		</div>
	</section>

	<section class="space-y-4">
		<h2 class="text-xl sm:text-2xl font-semibold">Market Prices</h2>
		{#if loading && marketData.length === 0}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each Array(5) as _}
					<div class="h-32 animate-pulse rounded-lg bg-gray-200"></div>
				{/each}
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each marketData as data (data.symbol)}
					<MarketCard {data} />
				{/each}
			</div>
		{/if}
	</section>
</div>
