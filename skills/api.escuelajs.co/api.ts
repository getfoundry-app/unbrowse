const BASE_URL = 'https://api.escuelajs.co/api/v1';

export class PlatziStoreClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getProducts(): Promise<any[]> { return this.request('/products'); }
  async getProduct(id: number): Promise<any> { return this.request(`/products/${id}`); }
  async getCategories(): Promise<any[]> { return this.request('/categories'); }
  async getUsers(): Promise<any[]> { return this.request('/users'); }
}

export default PlatziStoreClient;
