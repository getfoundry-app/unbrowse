const BASE_URL = 'https://serpapi.com';

export class SerpAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, params?: any): Promise<any> {
    const searchParams = new URLSearchParams({
      q: query,
      api_key: this.apiKey,
      engine: 'google',
      ...params,
    }).toString();
    const response = await fetch(`${BASE_URL}/search.json?${searchParams}`);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
    return response.json();
  }
}

export default SerpAPIClient;
