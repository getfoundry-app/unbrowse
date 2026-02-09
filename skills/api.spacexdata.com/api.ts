/**
 * SpaceX API Client
 */

const BASE_URL = 'https://api.spacexdata.com/v5';

export class SpaceXClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`);
    if (!response.ok) throw new Error(`SpaceX API error: ${response.status}`);
    return response.json();
  }

  async getLatestLaunch(): Promise<any> {
    return this.request('/launches/latest');
  }

  async getLaunches(): Promise<any[]> {
    return this.request('/launches');
  }

  async getLaunch(id: string): Promise<any> {
    return this.request(`/launches/${id}`);
  }

  async getRockets(): Promise<any[]> {
    return this.request('/rockets');
  }

  async getCrew(): Promise<any[]> {
    return this.request('/crew');
  }
}

export default SpaceXClient;
