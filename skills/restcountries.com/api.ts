/**
 * REST Countries API Client
 * Country information
 */

const BASE_URL = 'https://restcountries.com/v3.1';

export class RestCountriesClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`);
    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }
    return response.json();
  }

  async getAll(): Promise<any[]> {
    return this.request('/all');
  }

  async getByName(name: string, fullText = false): Promise<any[]> {
    return this.request(`/name/${name}${fullText ? '?fullText=true' : ''}`);
  }

  async getByCode(code: string): Promise<any[]> {
    return this.request(`/alpha/${code}`);
  }

  async getByCapital(capital: string): Promise<any[]> {
    return this.request(`/capital/${capital}`);
  }

  async getByRegion(region: string): Promise<any[]> {
    return this.request(`/region/${region}`);
  }
}

export default RestCountriesClient;
