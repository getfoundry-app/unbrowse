/**
 * CoinGecko API Client
 * Cryptocurrency prices and market data
 */

const BASE_URL = 'https://api.coingecko.com/api/v3';

export class CoinGeckoClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`);
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    return response.json();
  }

  async getSimplePrice(ids: string[], vsCurrencies: string[]): Promise<any> {
    const idsStr = ids.join(',');
    const vsStr = vsCurrencies.join(',');
    return this.request(`/simple/price?ids=${idsStr}&vs_currencies=${vsStr}`);
  }

  async getCoinsMarkets(vsCurrency: string, params?: any): Promise<any[]> {
    const query = new URLSearchParams({ vs_currency: vsCurrency, ...params }).toString();
    return this.request(`/coins/markets?${query}`);
  }

  async getCoin(id: string): Promise<any> {
    return this.request(`/coins/${id}`);
  }

  async getCoinsList(): Promise<any[]> {
    return this.request('/coins/list');
  }

  async getTrending(): Promise<any> {
    return this.request('/search/trending');
  }
}

export default CoinGeckoClient;
