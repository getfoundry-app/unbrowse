const BASE_URL = 'https://api.binance.com/api/v3';

export class BinanceClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getPrice(symbol?: string): Promise<any> {
    return this.request(`/ticker/price${symbol ? `?symbol=${symbol}` : ''}`);
  }

  async get24hrTicker(symbol?: string): Promise<any> {
    return this.request(`/ticker/24hr${symbol ? `?symbol=${symbol}` : ''}`);
  }

  async getOrderBook(symbol: string, limit = 100): Promise<any> {
    return this.request(`/depth?symbol=${symbol}&limit=${limit}`);
  }

  async getKlines(symbol: string, interval: string, limit = 500): Promise<any> {
    return this.request(`/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  }
}

export default BinanceClient;
