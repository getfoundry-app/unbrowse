const BASE_URL = 'https://api.chucknorris.io/jokes';

export class ChuckNorrisClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getRandom(): Promise<any> { return this.request('/random'); }
  async getCategories(): Promise<string[]> { return this.request('/categories'); }
}

export default ChuckNorrisClient;
