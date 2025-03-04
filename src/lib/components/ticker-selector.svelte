<script lang="ts">
    import Search from "lucide-svelte/icons/search";
    import { Input } from "$lib/components/ui/input/index.js";
    import { findTicker } from "$lib/utils/market";
    import type { AlphaVantageMatch } from "$lib/types/market";

    // Props
    let props = $props<{
        onSelect?: (ticker: AlphaVantageMatch) => void; 
    }>();
    
    let searchTerm = $state("");
    let isLoading = $state(false);
    let showResults = $state(false);
    let searchResults = $state<AlphaVantageMatch[]>([]);
    let containerRef = $state<HTMLDivElement>(null!);
    
    let searchTimeout: ReturnType<typeof setTimeout>;

    $effect(() => {
        handleSearch(searchTerm);
    });

    async function handleSearch(term: string) {
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Don't search if term is too short
        if (term.length < 3) {
            searchResults = [];
            return;
        }

        // Debounce the search
        searchTimeout = setTimeout(async () => {
            isLoading = true;
            try {
                searchResults = await findTicker(term);
                showResults = true;
            } catch (error) {
                console.error('Error searching tickers:', error);
                searchResults = [];
            } finally {
                isLoading = false;
            }
        }, 500);
    }

    function handleSelect(ticker: AlphaVantageMatch) {
        searchTerm = `${ticker["1. symbol"]} - ${ticker["2. name"]}`;
        showResults = false;
        props.onSelect?.(ticker);
    }

    // Handle clicks outside the component
    function handleClickOutside(event: MouseEvent) {
        if (containerRef && !containerRef.contains(event.target as Node)) {
            showResults = false;
        }
    }

    $effect(() => {
        if (showResults) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    });
</script>

<div class="relative w-full" bind:this={containerRef}>
    <div class="relative">
        <Input
            bind:value={searchTerm}
            placeholder="Search for a ticker (e.g. AAPL, MSFT)..."
            class="w-full pl-10"
        />
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
    </div>

    {#if (showResults && (searchResults.length > 0 || isLoading))}
        <div class="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
            {#if isLoading}
                <div class="p-2 text-sm text-muted-foreground">
                    Searching...
                </div>
            {:else}
                <div class="max-h-[300px] overflow-auto">
                    {#each searchResults as ticker}
                        <button
                            class="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                            onclick={() => handleSelect(ticker)}
                        >
                            <div class="flex flex-col">
                                <span class="font-medium">{ticker["1. symbol"]}</span>
                                <span class="text-xs text-muted-foreground">
                                    {ticker["2. name"]} ({ticker["4. region"]})
                                </span>
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>