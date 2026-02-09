const BASE_URL = 'https://api.publicapis.org';

export class PublicAPIsClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getEntries(): Promise<any> { return this.request('/entries'); }
  async getRandom(): Promise<any> { return this.request('/random'); }
  async getCategories(): Promise<any> { return this.request('/categories'); }
}

export default PublicAPIsClient;
