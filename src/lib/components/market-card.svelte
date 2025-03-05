<script lang="ts">
    import { Card } from "$lib/components/ui/card";
    import type { MarketData } from "$lib/types/market";
    
    let { data }: { data: MarketData } = $props();
    
    const formattedPrice = $derived(new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(data.price));
    
    const formattedChange = $derived(
        data.change24h 
            ? `${data.change24h > 0 ? '+' : ''}${data.change24h.toFixed(2)}%`
            : 'N/A'
    );
    
    const changeColor = $derived(
        !data.change24h
            ? 'text-gray-500'
            : data.change24h > 0
                ? 'text-green-500'
                : 'text-red-500'
    );
</script>

<Card class="p-4">
    <div class="flex justify-between items-center">
        <div>
            <h3 class="text-lg font-semibold">{data.symbol}</h3>
            <p class="text-sm text-gray-500">1D</p>
        </div>
        <div class="text-right">
            <p class="text-lg font-semibold">{formattedPrice}</p>
            <p class={changeColor}>{formattedChange}</p>
        </div>
    </div>
</Card> 