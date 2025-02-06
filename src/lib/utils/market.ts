import { error } from '@sveltejs/kit';

const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3';
const STOCK_API_URL = 'https://finnhub.io/api/v1';

export type MarketData = {
    symbol: string;
    name: string;
    price: number;
    change24h?: number;
    type: 'crypto' | 'stock';
};

/**
 * Fetches current price and 24-hour price change data for specified cryptocurrencies
 * from the CoinGecko API.
 * 
 * @param coins - Array of cryptocurrency IDs (e.g. ['bitcoin', 'ethereum'])
 * @returns Promise resolving to array of MarketData objects containing price info
 *          Returns empty array if the API request fails
 * 
 * @example
 * ```ts
 * const cryptoData = await fetchCryptoData(['bitcoin', 'ethereum']);
 * // Returns:
 * // [{
 * //   symbol: 'BITCOIN',
 * //   name: 'bitcoin', 
 * //   price: 42000.50,
 * //   change24h: 2.5,
 * //   type: 'crypto'
 * // }, ...]
 * ```
 */
export async function fetchCryptoData(coins: string[]): Promise<MarketData[]> {
    try {
        const response = await fetch(
            `${CRYPTO_API_URL}/simple/price?ids=${coins.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
            throw error(response.status, 'Failed to fetch crypto data');
        }

        const data = await response.json();
        return coins.map(coin => ({
            symbol: coin.toUpperCase(),
            name: coin,
            price: data[coin].usd,
            change24h: data[coin].usd_24h_change,
            type: 'crypto'
        }));
    } catch (err) {
        console.error('Error fetching crypto data:', err);
        return [];
    }
}

export async function fetchStockData(symbol: string): Promise<MarketData | null> {
    // Note: You'll need to add your Finnhub API key as an environment variable
    const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
    
    if (!API_KEY) {
        console.warn('Finnhub API key not found');
        return null;
    }

    try {
        const response = await fetch(
            `${STOCK_API_URL}/quote?symbol=${symbol}&token=${API_KEY}`
        );

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch stock data');
        }

        const data = await response.json();
        return {
            symbol,
            name: 'S&P 500',
            price: data.c,
            change24h: ((data.c - data.pc) / data.pc) * 100,
            type: 'stock'
        };
    } catch (err) {
        console.error('Error fetching stock data:', err);
        return null;
    }
} 