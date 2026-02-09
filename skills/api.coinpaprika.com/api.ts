const BASE_URL = 'https://api.coinpaprika.com/v1';

export class CoinpaprikaClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getCoins(): Promise<any[]> { return this.request('/coins'); }
  async getTickers(): Promise<any[]> { return this.request('/tickers'); }
  async getTicker(coinId: string): Promise<any> { return this.request(`/tickers/${coinId}`); }
  async getGlobal(): Promise<any> { return this.request('/global'); }
}

export default CoinpaprikaClient;
