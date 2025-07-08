<script lang="ts">
	import { Button } from '@/lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
	import { ArrowLeft, TrendingUp, Building, Globe, Calendar, BarChart2 } from "lucide-svelte";
	import type { PageData } from './$types';
	
	// Page data from server
	let { data } = $props<{ data: PageData }>();
	
	// State variables
	let security = $state(data.security);
	let loading = $state(false);
	
	// Format market cap to human-readable format
	function formatMarketCap(value: number | null): string {
		if (value === null || value === undefined) return 'N/A';
		
		if (value >= 1_000_000_000_000) {
			return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
		} else if (value >= 1_000_000_000) {
			return `$${(value / 1_000_000_000).toFixed(2)}B`;
		} else if (value >= 1_000_000) {
			return `$${(value / 1_000_000).toFixed(2)}M`;
		} else {
			return `$${value.toLocaleString()}`;
		}
	}
	
	// Format percentage change with color
	function getPercentChangeClass(value: number | null): string {
		if (value === null || value === undefined) return '';
		return value >= 0 ? 'text-green-600' : 'text-red-600';
	}
</script>

<div class="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
	<div class="flex items-center gap-2">
		<Button variant="ghost" size="icon" href="/app/secmaster">
			<ArrowLeft class="h-5 w-5" />
		</Button>
		<h1 class="text-2xl sm:text-3xl font-bold">
			{security.symbol} - {security.name || 'Unknown Security'}
		</h1>
	</div>
	
	<!-- Security overview -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<!-- Price card -->
		<Card>
			<CardHeader>
				<CardTitle>Price Information</CardTitle>
				<CardDescription>Latest trading data</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">Last Sale</span>
					<span class="text-xl font-semibold">${security.lastSale?.toFixed(2) ?? 'N/A'}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">Net Change</span>
					<span class={getPercentChangeClass(security.netChange)}>
						{security.netChange !== null && security.netChange !== undefined ? 
							`${security.netChange >= 0 ? '+' : ''}$${Math.abs(security.netChange).toFixed(2)}` : 'N/A'}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">% Change</span>
					<span class={getPercentChangeClass(security.percentChange)}>
						{security.percentChange !== null && security.percentChange !== undefined ? 
							`${security.percentChange >= 0 ? '+' : ''}${security.percentChange.toFixed(2)}%` : 'N/A'}
					</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">Volume</span>
					<span>{security.volume?.toLocaleString() ?? 'N/A'}</span>
				</div>
			</CardContent>
		</Card>
		
		<!-- Company info card -->
		<Card>
			<CardHeader>
				<CardTitle>Company Information</CardTitle>
				<CardDescription>Key company details</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-2">
						<Building class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">Sector</span>
					</div>
					<span>{security.sector || 'N/A'}</span>
				</div>
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-2">
						<BarChart2 class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">Industry</span>
					</div>
					<span>{security.industry || 'N/A'}</span>
				</div>
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-2">
						<Globe class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">Country</span>
					</div>
					<span>{security.country || 'N/A'}</span>
				</div>
				<div class="flex justify-between items-center">
					<div class="flex items-center gap-2">
						<Calendar class="h-4 w-4 text-muted-foreground" />
						<span class="text-muted-foreground">IPO Year</span>
					</div>
					<span>{security.ipoYear || 'N/A'}</span>
				</div>
			</CardContent>
		</Card>
		
		<!-- Market data card -->
		<Card>
			<CardHeader>
				<CardTitle>Market Data</CardTitle>
				<CardDescription>Market valuation metrics</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">Market Cap</span>
					<span>{formatMarketCap(security.marketCap)}</span>
				</div>
				<div class="flex justify-between items-center">
					<span class="text-muted-foreground">Last Updated</span>
					<span>{security.updatedAt ? new Date(security.updatedAt).toLocaleString() : 'N/A'}</span>
				</div>
			</CardContent>
			<CardFooter>
				<Button variant="outline" class="w-full" disabled={loading}>
					<TrendingUp class="mr-2 h-4 w-4" />
					View Price Chart
				</Button>
			</CardFooter>
		</Card>
	</div>
	
	<!-- Tabs for additional information -->
	<Tabs value="overview" class="w-full">
		<TabsList class="grid w-full grid-cols-3">
			<TabsTrigger value="overview">Overview</TabsTrigger>
			<TabsTrigger value="financials">Financials</TabsTrigger>
			<TabsTrigger value="news">News</TabsTrigger>
		</TabsList>
		<TabsContent value="overview" class="space-y-4 pt-4">
			<Card>
				<CardHeader>
					<CardTitle>Company Overview</CardTitle>
					<CardDescription>Detailed information about {security.name || security.symbol}</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground">
						Detailed company information will be displayed here. This could include company description,
						business model, key products, and other relevant information.
					</p>
				</CardContent>
			</Card>
		</TabsContent>
		<TabsContent value="financials" class="space-y-4 pt-4">
			<Card>
				<CardHeader>
					<CardTitle>Financial Information</CardTitle>
					<CardDescription>Key financial metrics for {security.symbol}</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground">
						Financial data such as revenue, earnings, P/E ratio, dividend yield, and other
						financial metrics would be displayed here.
					</p>
				</CardContent>
			</Card>
		</TabsContent>
		<TabsContent value="news" class="space-y-4 pt-4">
			<Card>
				<CardHeader>
					<CardTitle>Recent News</CardTitle>
					<CardDescription>Latest news about {security.name || security.symbol}</CardDescription>
				</CardHeader>
				<CardContent>
					<p class="text-muted-foreground">
						Recent news articles, press releases, and other media mentions related to the company
						would be displayed here.
					</p>
				</CardContent>
			</Card>
		</TabsContent>
	</Tabs>
</div> 