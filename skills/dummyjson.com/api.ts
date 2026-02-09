const BASE_URL = 'https://dummyjson.com';

export class DummyJSONClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getProducts(): Promise<any> { return this.request('/products'); }
  async getUsers(): Promise<any> { return this.request('/users'); }
  async getPosts(): Promise<any> { return this.request('/posts'); }
  async getTodos(): Promise<any> { return this.request('/todos'); }
  async getQuotes(): Promise<any> { return this.request('/quotes'); }
  async getRecipes(): Promise<any> { return this.request('/recipes'); }
}

export default DummyJSONClient;
