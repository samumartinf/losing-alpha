<script lang="ts">
	import { onDestroy } from 'svelte';
    import { fetchCryptoData, fetchStockData, type MarketData } from '$lib/utils/market';
    import MarketCard from '$lib/components/market-card.svelte';
    import { onMount } from 'svelte';
    
    let marketData = $state<MarketData[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    
    const cryptoCoins = ['bitcoin', 'ethereum', 'cardano', 'solana'];
    
    async function fetchAllMarketData() {
        try {
            loading = true;
            error = null;
            
            const [cryptoData, stockData] = await Promise.all([
                fetchCryptoData(cryptoCoins),
                fetchStockData('SPY')
            ]);
            
            marketData = [
                ...(stockData ? [stockData] : []),
                ...cryptoData
            ];
        } catch (err) {
            console.error('Error fetching market data:', err);
            error = 'Failed to fetch market data. Please try again later.';
        } finally {
            loading = false;
        }
    }
    
    // Fetch data on mount
    onMount(() => {
        fetchAllMarketData();
    });
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchAllMarketData, 60000);
    
    onDestroy(() => {
        clearInterval(interval);
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Market Overview</h1>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
        </div>
    {/if}
    
    {#if loading && marketData.length === 0}
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {#each Array(5) as _}
                <div class="animate-pulse bg-gray-200 rounded-lg h-32"></div>
            {/each}
        </div>
    {:else}
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {#each marketData as data (data.symbol)}
                <MarketCard {data} />
            {/each}
        </div>
    {/if}
</div>
