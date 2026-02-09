const BASE_URL = 'https://fakestoreapi.com';

export class FakeStoreClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getProducts(): Promise<any[]> {
    return this.request('/products');
  }

  async getProduct(id: number): Promise<any> {
    return this.request(`/products/${id}`);
  }

  async getCategories(): Promise<string[]> {
    return this.request('/products/categories');
  }

  async getProductsByCategory(category: string): Promise<any[]> {
    return this.request(`/products/category/${category}`);
  }

  async getCarts(): Promise<any[]> {
    return this.request('/carts');
  }

  async getUsers(): Promise<any[]> {
    return this.request('/users');
  }
}

export default FakeStoreClient;
