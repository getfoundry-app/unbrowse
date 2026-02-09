const BASE_URL = 'https://api.reddit.com';

export class RedditClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'User-Agent': 'OpenClaw/1.0' }
    });
    return response.json();
  }

  async getSubreddit(subreddit: string, limit = 25): Promise<any> {
    return this.request(`/r/${subreddit}.json?limit=${limit}`);
  }

  async getHot(subreddit: string, limit = 25): Promise<any> {
    return this.request(`/r/${subreddit}/hot.json?limit=${limit}`);
  }

  async getNew(subreddit: string, limit = 25): Promise<any> {
    return this.request(`/r/${subreddit}/new.json?limit=${limit}`);
  }

  async getUser(username: string): Promise<any> {
    return this.request(`/user/${username}/about.json`);
  }
}

export default RedditClient;
