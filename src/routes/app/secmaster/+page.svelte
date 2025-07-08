<script lang="ts">
	import { Button } from '@/lib/components/ui/button';
	import { Input } from '@/lib/components/ui/input';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
	import { Badge } from '@/lib/components/ui/badge';
	import { Skeleton } from '@/lib/components/ui/skeleton';
	import { ArrowUpDown, Search, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	
	// Page data from server
	let { data } = $props<{ data: PageData }>();
	
	// State variables
	let securities = $state<any[]>([]);
	let filteredSecurities = $state<any[]>([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let selectedSector = $state('all');
	let selectedCountry = $state('all');
	let sortField = $state('symbol');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	
	// Regular arrays for sectors and countries
	let sectorsList = $state<string[]>(['all']);
	let countriesList = $state<string[]>(['all']);
	
	// Load securities from server and initialize filters
	$effect(() => {
		if (data.securities && securities.length === 0) { // Only run once when securities is empty
			securities = data.securities;
			
			// Extract unique sectors and countries
			const uniqueSectors = [...new Set(securities.map(s => s.sector).filter(Boolean))];
			sectorsList = ['all', ...uniqueSectors.sort()];
			
			const uniqueCountries = [...new Set(securities.map(s => s.country).filter(Boolean))];
			countriesList = ['all', ...uniqueCountries.sort()];
			
			loading = false;
		}
	});

	// Watch for changes in filter values and apply filters
	$effect(() => {
		// Only run if securities are loaded
		if (securities.length > 0) {
			searchQuery; selectedSector; selectedCountry; sortField; sortDirection; // Track these values
			applyFilters();
		}
	});

	// Filter and sort securities
	function applyFilters() {
		// Start with all securities
		let result = [...securities];

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(security => 
				security.symbol.toLowerCase().includes(query) || 
				(security.name && security.name.toLowerCase().includes(query))
			);
		}

		// Apply sector filter
		if (selectedSector !== 'all') {
			result = result.filter(security => security.sector === selectedSector);
		}

		// Apply country filter
		if (selectedCountry !== 'all') {
			result = result.filter(security => security.country === selectedCountry);
		}

		// Apply sorting
		result.sort((a, b) => {
			let valueA = a[sortField];
			let valueB = b[sortField];
			
			// Handle numeric values
			if (typeof valueA === 'number' && typeof valueB === 'number') {
				return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
			}
			
			// Handle string values
			valueA = String(valueA || '').toLowerCase();
			valueB = String(valueB || '').toLowerCase();
			
			if (sortDirection === 'asc') {
				return valueA.localeCompare(valueB);
			} else {
				return valueB.localeCompare(valueA);
			}
		});

		filteredSecurities = result;
	}

	// Helper function to safely convert to number
	function safeToNumber(value: any): number | null {
		if (value === null || value === undefined || value === '') return null;
		const num = Number(value);
		return isNaN(num) ? null : num;
	}
	
	// Sort by column
	function sortBy(field: string) {
		if (sortField === field) {
			// Toggle direction if already sorting by this field
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Set new field and default to ascending
			sortField = field;
			sortDirection = 'asc';
		}
	}
	
	// Clear all filters
	function clearFilters() {
		searchQuery = '';
		selectedSector = 'all';
		selectedCountry = 'all';
	}
	
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
	
	// Handle row click
	function handleRowClick(symbol: string) {
		window.location.href = `/app/secmaster/${symbol}`;
	}
	
	// Handle column header click
	function handleColumnClick(field: string) {
		sortBy(field);
	}
</script>

<div class="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
	<header class="flex flex-col gap-4">
		<h1 class="text-2xl sm:text-3xl font-bold">Securities Search</h1>
		
		<!-- Search and filters -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4">
			<!-- Search input -->
			<div class="relative md:col-span-2">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input 
					type="text" 
					placeholder="Search by symbol or name..." 
					bind:value={searchQuery}
					class="pl-9"
				/>
			</div>
			
			<!-- Sector filter -->
			<div>
				<select 
					class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
					bind:value={selectedSector}
				>
					{#each sectorsList as sector}
						<option value={sector}>{sector === 'all' ? 'All Sectors' : sector}</option>
					{/each}
				</select>
			</div>
			
			<!-- Country filter -->
			<div>
				<select 
					class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
					bind:value={selectedCountry}
				>
					{#each countriesList as country}
						<option value={country}>{country === 'all' ? 'All Countries' : country}</option>
					{/each}
				</select>
			</div>
		</div>
		
		<!-- Filter summary and clear button -->
		<div class="flex justify-between items-center">
			<div class="flex flex-wrap gap-2 items-center">
				<span class="text-sm text-muted-foreground">
					{filteredSecurities.length} of {securities.length} securities
				</span>
				
				{#if searchQuery}
					<Badge variant="outline" class="flex gap-1 items-center">
						Search: {searchQuery}
						<button onclick={() => searchQuery = ''} class="h-3.5 w-3.5 hover:text-destructive">
							<X class="h-3.5 w-3.5" />
						</button>
					</Badge>
				{/if}
				
				{#if selectedSector !== 'all'}
					<Badge variant="outline" class="flex gap-1 items-center">
						Sector: {selectedSector}
						<button onclick={() => selectedSector = 'all'} class="h-3.5 w-3.5 hover:text-destructive">
							<X class="h-3.5 w-3.5" />
						</button>
					</Badge>
				{/if}
				
				{#if selectedCountry !== 'all'}
					<Badge variant="outline" class="flex gap-1 items-center">
						Country: {selectedCountry}
						<button onclick={() => selectedCountry = 'all'} class="h-3.5 w-3.5 hover:text-destructive">
							<X class="h-3.5 w-3.5" />
						</button>
					</Badge>
				{/if}
			</div>
			
			{#if searchQuery || selectedSector !== 'all' || selectedCountry !== 'all'}
				<Button variant="ghost" size="sm" onclick={clearFilters}>Clear all filters</Button>
			{/if}
		</div>
	</header>
	
	<!-- Securities table -->
	<div class="rounded-md border">
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="w-[100px] cursor-pointer" onclick={() => handleColumnClick('symbol')}>
						<div class="flex items-center space-x-1">
							<span>Symbol</span>
							{#if sortField === 'symbol'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer" onclick={() => handleColumnClick('name')}>
						<div class="flex items-center space-x-1">
							<span>Name</span>
							{#if sortField === 'name'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer text-right" onclick={() => handleColumnClick('lastSale')}>
						<div class="flex items-center justify-end space-x-1">
							<span>Last Sale</span>
							{#if sortField === 'lastSale'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer text-right" onclick={() => handleColumnClick('percentChange')}>
						<div class="flex items-center justify-end space-x-1">
							<span>% Change</span>
							{#if sortField === 'percentChange'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer text-right" onclick={() => handleColumnClick('marketCap')}>
						<div class="flex items-center justify-end space-x-1">
							<span>Market Cap</span>
							{#if sortField === 'marketCap'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer" onclick={() => handleColumnClick('sector')}>
						<div class="flex items-center space-x-1">
							<span>Sector</span>
							{#if sortField === 'sector'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
					<TableHead class="cursor-pointer hidden md:table-cell" onclick={() => handleColumnClick('country')}>
						<div class="flex items-center space-x-1">
							<span>Country</span>
							{#if sortField === 'country'}
								<ArrowUpDown class="h-4 w-4" data-direction={sortDirection} />
							{/if}
						</div>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#if loading}
					{#each Array(10) as _}
						<TableRow>
							<TableCell><Skeleton class="h-6 w-16" /></TableCell>
							<TableCell><Skeleton class="h-6 w-full" /></TableCell>
							<TableCell><Skeleton class="h-6 w-16" /></TableCell>
							<TableCell><Skeleton class="h-6 w-16" /></TableCell>
							<TableCell><Skeleton class="h-6 w-24" /></TableCell>
							<TableCell><Skeleton class="h-6 w-24" /></TableCell>
							<TableCell class="hidden md:table-cell"><Skeleton class="h-6 w-20" /></TableCell>
						</TableRow>
					{/each}
				{:else if filteredSecurities.length === 0}
					<TableRow>
						<TableCell class="h-24 text-center" colspan={7}>
							<div class="flex flex-col items-center justify-center space-y-2">
								<p class="text-lg font-medium">No securities found</p>
								<p class="text-sm text-muted-foreground">Try adjusting your search or filters</p>
								<Button variant="outline" size="sm" onclick={clearFilters}>Clear all filters</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					{#each filteredSecurities as security (security.id)}
						<TableRow class="cursor-pointer hover:bg-muted/50" onclick={() => handleRowClick(security.symbol)}>
							<TableCell class="font-medium">{security.symbol}</TableCell>
							<TableCell>{security.name || 'N/A'}</TableCell>
							<TableCell class="text-right">
								{#if safeToNumber(security.lastSale) !== null}
									${safeToNumber(security.lastSale).toFixed(2)}
								{:else}
									N/A
								{/if}
							</TableCell>
							<TableCell class="text-right">
								{@const percentValue = safeToNumber(security.percentChange)}
								{#if percentValue !== null}
									<span class={percentValue >= 0 ? 'text-green-600' : 'text-red-600'}>
										{percentValue >= 0 ? '+' : ''}{percentValue.toFixed(2)}%
									</span>
								{:else}
									<span>N/A</span>
								{/if}
							</TableCell>
							<TableCell class="text-right">{formatMarketCap(security.marketCap)}</TableCell>
							<TableCell>{security.sector || 'N/A'}</TableCell>
							<TableCell class="hidden md:table-cell">{security.country || 'N/A'}</TableCell>
						</TableRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
	
	<!-- Pagination (simplified for now) -->
	{#if filteredSecurities.length > 0}
		<div class="flex justify-between items-center">
			<p class="text-sm text-muted-foreground">
				Showing <span class="font-medium">{Math.min(filteredSecurities.length, 50)}</span> of <span class="font-medium">{filteredSecurities.length}</span> securities
			</p>
			<div class="flex space-x-2">
				<Button variant="outline" size="sm" disabled={true}>Previous</Button>
				<Button variant="outline" size="sm" disabled={filteredSecurities.length <= 50}>Next</Button>
			</div>
		</div>
	{/if}
</div>
