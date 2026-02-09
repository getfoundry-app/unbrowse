const BASE_URL = 'https://newsapi.org/v2';

export class NewsAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'X-Api-Key': this.apiKey }
    });
    if (!response.ok) throw new Error(`News API error: ${response.status}`);
    return response.json();
  }

  async getTopHeadlines(params?: { country?: string; category?: string; q?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/top-headlines?${query}`);
  }

  async getEverything(query: string, params?: any): Promise<any> {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/everything?${searchParams}`);
  }

  async getSources(): Promise<any> {
    return this.request('/sources');
  }
}

export default NewsAPIClient;
