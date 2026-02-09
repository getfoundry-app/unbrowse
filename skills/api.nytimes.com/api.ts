const BASE_URL = 'https://api.nytimes.com/svc';

export class NYTimesClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const separator = path.includes('?') ? '&' : '?';
    const response = await fetch(`${BASE_URL}${path}${separator}api-key=${this.apiKey}`);
    if (!response.ok) throw new Error(`NYT API error: ${response.status}`);
    return response.json();
  }

  async getTopStories(section = 'home'): Promise<any> {
    return this.request(`/topstories/v2/${section}.json`);
  }

  async searchArticles(query: string): Promise<any> {
    return this.request(`/search/v2/articlesearch.json?q=${encodeURIComponent(query)}`);
  }

  async getBestsellers(list = 'hardcover-fiction'): Promise<any> {
    return this.request(`/books/v3/lists/current/${list}.json`);
  }
}

export default NYTimesClient;
