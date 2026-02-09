const BASE_URL = 'https://catfact.ninja';

export class CatFactClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getFact(): Promise<{ fact: string; length: number }> {
    return this.request('/fact');
  }

  async getFacts(limit = 10): Promise<any> {
    return this.request(`/facts?limit=${limit}`);
  }
}

export default CatFactClient;
