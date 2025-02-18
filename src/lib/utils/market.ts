import { error } from '@sveltejs/kit';

const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3';
const STOCK_API_URL = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
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

export interface AlphaVantageMatch {
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "5. marketOpen": string;
    "6. marketClose": string;
    "7. timezone": string;
    "8. currency": string;
    "9. matchScore": string;
}

export interface AlphaVantageSearchResponse {
    bestMatches: AlphaVantageMatch[];
}

/**
 * Finds a ticker by searching the local securities database.
 * Falls back to Alpha Vantage API if useApi is true.
 * 
 * @param symbol - The symbol or name to search for
 * @param useApi - Whether to use the Alpha Vantage API as fallback (default: false)
 * @returns Promise resolving to array of matching tickers
 */
export async function findTicker(symbol: string, useApi: boolean = false): Promise<AlphaVantageMatch[]> {
    try {
        // First try local database
        const response = await fetch(`/api/ticker/search?q=${encodeURIComponent(symbol)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch from local database');
        }
        const data = await response.json();
        
        // If we have local results or don't want to use API, return local results
        if (data.matches.length > 0 || !useApi) {
            return data.matches;
        }

        if (useApi) {
            return await findTickerAlphaVantage(symbol);
        }

    } catch (err) {
        console.error('Error fetching ticker:', err);
        return [];
    }
}

async function findTickerAlphaVantage(symbol: string): Promise<AlphaVantageMatch[]> {
    try {
        const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
        const url = `${ALPHA_VANTAGE_API_URL}?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${apiKey}`;
        const apiResponse = await fetch(url);
        const apiData = await apiResponse.json() as AlphaVantageSearchResponse;
        return apiData.bestMatches;
    } catch (err) {
        console.error('Error fetching ticker:', err);
        return [];
    }
}

export interface AlphaVantageDailyResponse {
    "Time Series (Daily)": {
        [date: string]: {
            "1. open": string;
            "2. high": string;
            "3. low": string;
            "4. close": string;
            "5. volume": string;
        }
    }
}

/**
 * Fetches daily OHLCV (Open, High, Low, Close, Volume) data for a given ticker symbol using the Alpha Vantage API.
 * 
 * @param ticker - The stock ticker symbol to fetch data for (e.g. 'AAPL', 'MSFT')
 * @returns Promise resolving to daily time series data containing OHLCV values, or null if the request fails
 * @throws Will log but not throw errors if the API request fails
 */
export async function fetchDailyOHLCV(ticker: string): Promise<AlphaVantageDailyResponse | null> {
    var apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
    try {
        var url = `${ALPHA_VANTAGE_API_URL}?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`;
        var response = await fetch(url);
        var data = await response.json() as AlphaVantageDailyResponse;
        return data;
    } catch (err) {
        console.error('Error fetching market data:', err);
        return null;
    }
}