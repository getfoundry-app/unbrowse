const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

export class CocktailDBClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async search(name: string): Promise<any> {
    return this.request(`/search.php?s=${encodeURIComponent(name)}`);
  }

  async getRandom(): Promise<any> {
    return this.request('/random.php');
  }

  async lookup(id: string): Promise<any> {
    return this.request(`/lookup.php?i=${id}`);
  }
}

export default CocktailDBClient;
