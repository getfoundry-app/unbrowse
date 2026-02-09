const BASE_URL = 'https://api.thecatapi.com/v1';

export class TheCatAPIClient {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const headers: HeadersInit = {};
    if (this.apiKey) headers['x-api-key'] = this.apiKey;
    const response = await fetch(`${BASE_URL}${path}`, { headers });
    return response.json();
  }

  async searchImages(limit = 10): Promise<any[]> {
    return this.request(`/images/search?limit=${limit}`);
  }

  async getBreeds(): Promise<any[]> {
    return this.request('/breeds');
  }
}

export default TheCatAPIClient;
