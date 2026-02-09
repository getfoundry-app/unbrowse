const BASE_URL = 'https://api.jikan.moe/v4';

export class JikanClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async searchAnime(query: string): Promise<any> {
    return this.request(`/anime?q=${encodeURIComponent(query)}`);
  }

  async getAnime(id: number): Promise<any> {
    return this.request(`/anime/${id}`);
  }

  async searchManga(query: string): Promise<any> {
    return this.request(`/manga?q=${encodeURIComponent(query)}`);
  }

  async getTopAnime(): Promise<any> {
    return this.request('/top/anime');
  }
}

export default JikanClient;
