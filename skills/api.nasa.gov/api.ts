const BASE_URL = 'https://api.nasa.gov';

export class NASAClient {
  private apiKey: string;

  constructor(apiKey = 'DEMO_KEY') {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getAPOD(date?: string): Promise<any> {
    const dateParam = date ? `&date=${date}` : '';
    return this.request(`/planetary/apod?api_key=${this.apiKey}${dateParam}`);
  }

  async getMarsPhotos(rover: string, sol: number): Promise<any> {
    return this.request(`/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${this.apiKey}`);
  }
}

export default NASAClient;
