const BASE_URL = 'https://api.alternative.me';

export class AlternativeMeClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getFearGreedIndex(limit = 1): Promise<any> {
    return this.request(`/fng/?limit=${limit}`);
  }

  async getTicker(): Promise<any> {
    return this.request('/v2/ticker/');
  }
}

export default AlternativeMeClient;
