import { error } from '@sveltejs/kit';
import type {
    MarketData,
    TimeSeriesData,
    CandleData,
    AlphaVantageMatch,
    AlphaVantageSearchResponse,
    AlphaVantageDailyResponse,
    KrakenOHLCResponse,
    KrakenOHLCResult
} from '$lib/types/market';

const CRYPTO_API_URL = 'https://api.coingecko.com/api/v3';
const STOCK_API_URL = 'https://finnhub.io/api/v1';
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';
const KRAKEN_API_URL = 'https://api.kraken.com/0/public';

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

        return []; // Add explicit return for empty results
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

/**
 * Converts AlphaVantage daily response to the API-agnostic TimeSeriesData format
 * 
 * @param ticker - The stock ticker symbol
 * @param data - AlphaVantage daily response data
 * @returns TimeSeriesData object with standardized candle data
 */
export function convertAlphaVantageToTimeSeriesData(
    ticker: string, 
    data: AlphaVantageDailyResponse
): TimeSeriesData {
    const candles: CandleData[] = [];
    const timeSeries = data["Time Series (Daily)"];
    
    for (const dateStr in timeSeries) {
        const dateData = timeSeries[dateStr];
        const timestamp = new Date(dateStr).getTime();
        
        candles.push({
            timestamp,
            date: dateStr,
            open: parseFloat(dateData["1. open"]),
            high: parseFloat(dateData["2. high"]),
            low: parseFloat(dateData["3. low"]),
            close: parseFloat(dateData["4. close"]),
            volume: parseFloat(dateData["5. volume"])
        });
    }
    
    // Sort by timestamp, newest first
    candles.sort((a, b) => b.timestamp - a.timestamp);
    
    return {
        symbol: ticker,
        interval: '1d',
        candles,
        lastUpdated: Date.now()
    };
}

/**
 * Converts Kraken OHLC response to the API-agnostic TimeSeriesData format
 * 
 * @param pair - Trading pair (e.g. 'BTCUSD')
 * @param data - Kraken OHLC response data
 * @param interval - Time interval in minutes
 * @returns TimeSeriesData object with standardized candle data
 */
export function convertKrakenToTimeSeriesData(
    pair: string,
    data: KrakenOHLCResponse,
    interval: number
): TimeSeriesData {
    const candles: CandleData[] = [];
    const ohlcData = data.result[pair];
    
    ohlcData.forEach(([time, open, high, low, close, _vwap, volume]) => {
        const timestamp = time * 1000; // Convert to milliseconds
        const date = new Date(timestamp).toISOString().split('T')[0];
        
        candles.push({
            timestamp,
            date,
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            volume: parseFloat(volume)
        });
    });
    
    // Sort by timestamp, newest first
    candles.sort((a, b) => b.timestamp - a.timestamp);
    
    // Map Kraken interval to standardized interval string
    const intervalMap: {[key: number]: string} = {
        1: '1m',
        5: '5m',
        15: '15m',
        30: '30m',
        60: '1h',
        240: '4h',
        1440: '1d',
        10080: '1w',
        21600: '15d'
    };
    
    return {
        symbol: pair,
        interval: intervalMap[interval] || `${interval}m`,
        candles,
        lastUpdated: Date.now()
    };
}

/**
 * Fetches OHLC data from Kraken API and returns it in the standardized TimeSeriesData format
 * 
 * @param pair - Trading pair (e.g. 'BTCUSD')
 * @param interval - Time interval in minutes (1, 5, 15, 30, 60, 240, 1440, 10080, 21600)
 * @param since - Return data since given timestamp (optional)
 * @returns Promise resolving to TimeSeriesData format
 */
export async function fetchKrakenOHLCVStandardized(
    pair: string,
    interval: number = 1440,
    since?: number
): Promise<TimeSeriesData | null> {
    try {
        const url = new URL(`${KRAKEN_API_URL}/OHLC`);
        url.searchParams.append('pair', pair);
        url.searchParams.append('interval', interval.toString());
        if (since) {
            url.searchParams.append('since', since.toString());
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch from Kraken API');
        }

        const data = await response.json() as KrakenOHLCResponse;
        
        if (data.error && data.error.length > 0) {
            throw new Error(`Kraken API error: ${data.error.join(', ')}`);
        }

        return convertKrakenToTimeSeriesData(pair, data, interval);
    } catch (err) {
        console.error('Error fetching Kraken OHLCV data:', err);
        return null;
    }
}

/**
 * Fetches daily OHLCV data for a given ticker symbol using Alpha Vantage API
 * and returns it in the standardized TimeSeriesData format
 * 
 * @param ticker - The stock ticker symbol to fetch data for (e.g. 'AAPL', 'MSFT')
 * @returns Promise resolving to TimeSeriesData format, or null if the request fails
 */
export async function fetchDailyOHLCVStandardized(ticker: string): Promise<TimeSeriesData | null> {
    try {
        const data = await fetchDailyOHLCV(ticker);
        if (!data) return null;
        
        return convertAlphaVantageToTimeSeriesData(ticker, data);
    } catch (err) {
        console.error('Error fetching standardized market data:', err);
        return null;
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

// Keep the original fetchKrakenOHLCV for backward compatibility
export async function fetchKrakenOHLCV(
    pair: string,
    interval: number = 1440,
    since?: number
): Promise<AlphaVantageDailyResponse | null> {
    try {
        const url = new URL(`${KRAKEN_API_URL}/OHLC`);
        url.searchParams.append('pair', pair);
        url.searchParams.append('interval', interval.toString());
        if (since) {
            url.searchParams.append('since', since.toString());
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch from Kraken API');
        }

        const data = await response.json() as KrakenOHLCResponse;
        
        if (data.error && data.error.length > 0) {
            throw new Error(`Kraken API error: ${data.error.join(', ')}`);
        }

        // Convert to AlphaVantage format
        const timeSeries: { [key: string]: any } = {};
        const ohlcData = data.result[pair];

        ohlcData.forEach(([time, open, high, low, close, _vwap, volume]) => {
            const date = new Date(time * 1000).toISOString().split('T')[0];
            timeSeries[date] = {
                "1. open": open,
                "2. high": high,
                "3. low": low,
                "4. close": close,
                "5. volume": volume
            };
        });

        return {
            "Time Series (Daily)": timeSeries
        };
    } catch (err) {
        console.error('Error fetching Kraken OHLCV data:', err);
        return null;
    }
}