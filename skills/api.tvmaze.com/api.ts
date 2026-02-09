const BASE_URL = 'https://api.tvmaze.com';

export class TVMazeClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async searchShows(query: string): Promise<any[]> {
    return this.request(`/search/shows?q=${encodeURIComponent(query)}`);
  }

  async getShow(id: number): Promise<any> {
    return this.request(`/shows/${id}`);
  }

  async getEpisodes(showId: number): Promise<any[]> {
    return this.request(`/shows/${showId}/episodes`);
  }
}

export default TVMazeClient;
