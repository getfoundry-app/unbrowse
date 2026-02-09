const BASE_URL = 'https://api.quotable.io';

export class QuotableClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getRandom(): Promise<any> { return this.request('/random'); }
  async getQuotes(): Promise<any> { return this.request('/quotes'); }
  async getAuthors(): Promise<any> { return this.request('/authors'); }
}

export default QuotableClient;
