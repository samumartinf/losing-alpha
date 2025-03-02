/**
 * Basic market data type for current price information
 */
export type MarketData = {
    symbol: string;
    name: string;
    price: number;
    change24h?: number;
    type: 'crypto' | 'stock';
};

/**
 * Represents a single candlestick data point
 */
export interface CandleData {
    timestamp: number;      // Unix timestamp in milliseconds
    date: string;          // ISO date string (YYYY-MM-DD)
    open: number;          // Opening price
    high: number;          // Highest price
    low: number;           // Lowest price
    close: number;         // Closing price
    volume: number;        // Trading volume
}

/**
 * Represents a complete time series of candle data
 */
export interface TimeSeriesData {
    symbol: string;         // Trading symbol/pair
    interval: string;       // Time interval (e.g., '1d', '1h', '15m')
    candles: CandleData[];  // Array of candle data sorted by timestamp (newest first)
    lastUpdated: number;    // Unix timestamp of last update in milliseconds
}

/**
 * Alpha Vantage API specific types
 */
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
 * Kraken API specific types
 */
export interface KrakenOHLCResult {
    [key: string]: Array<[
        number,   // time
        string,   // open
        string,   // high
        string,   // low
        string,   // close
        string,   // vwap
        string,   // volume
        number    // count
    ]>;
}

export interface KrakenOHLCResponse {
    error: string[];
    result: KrakenOHLCResult & {
        last: number;
    };
} 