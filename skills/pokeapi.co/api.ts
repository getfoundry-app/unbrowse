const BASE_URL = 'https://pokeapi.co/api/v2';

export class PokeAPIClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getPokemon(limit = 20, offset = 0): Promise<any> {
    return this.request(`/pokemon?limit=${limit}&offset=${offset}`);
  }

  async getPokemonById(id: string | number): Promise<any> {
    return this.request(`/pokemon/${id}`);
  }

  async getType(id: string | number): Promise<any> {
    return this.request(`/type/${id}`);
  }

  async getAbility(id: string | number): Promise<any> {
    return this.request(`/ability/${id}`);
  }
}

export default PokeAPIClient;
