const BASE_URL = 'https://swapi.dev/api';

export class SWAPIClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getPeople(): Promise<any> { return this.request('/people/'); }
  async getPerson(id: number): Promise<any> { return this.request(`/people/${id}/`); }
  async getPlanets(): Promise<any> { return this.request('/planets/'); }
  async getFilms(): Promise<any> { return this.request('/films/'); }
  async getStarships(): Promise<any> { return this.request('/starships/'); }
  async getVehicles(): Promise<any> { return this.request('/vehicles/'); }
  async getSpecies(): Promise<any> { return this.request('/species/'); }
}

export default SWAPIClient;
