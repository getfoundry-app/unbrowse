const BASE_URL = 'https://api.twitter.com/2';

export class TwitterClient {
  private bearerToken: string;

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Authorization': `Bearer ${this.bearerToken}` }
    });
    if (!response.ok) throw new Error(`Twitter API error: ${response.status}`);
    return response.json();
  }

  async getTweet(id: string): Promise<any> {
    return this.request(`/tweets/${id}`);
  }

  async getUser(id: string): Promise<any> {
    return this.request(`/users/${id}`);
  }

  async searchRecent(query: string): Promise<any> {
    return this.request(`/tweets/search/recent?query=${encodeURIComponent(query)}`);
  }
}

export default TwitterClient;
