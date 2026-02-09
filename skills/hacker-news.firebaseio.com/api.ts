/**
 * Hacker News API Client
 * Official Firebase API for Hacker News
 * https://hacker-news.firebaseio.com/v0
 */

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export interface Story {
  id: number;
  type: 'story';
  by: string;
  time: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  descendants: number;
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
}

export interface Comment {
  id: number;
  type: 'comment';
  by: string;
  time: number;
  text: string;
  parent: number;
  kids?: number[];
  dead?: boolean;
  deleted?: boolean;
}

export interface Job {
  id: number;
  type: 'job';
  by: string;
  time: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
}

export type Item = Story | Comment | Job;

export interface User {
  id: string;
  created: number;
  karma: number;
  about?: string;
  submitted?: number[];
}

export interface Updates {
  items: number[];
  profiles: string[];
}

export class HackerNewsClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`);
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  async getTopStories(): Promise<number[]> {
    return this.request<number[]>('/topstories.json');
  }

  async getNewStories(): Promise<number[]> {
    return this.request<number[]>('/newstories.json');
  }

  async getBestStories(): Promise<number[]> {
    return this.request<number[]>('/beststories.json');
  }

  async getAskStories(): Promise<number[]> {
    return this.request<number[]>('/askstories.json');
  }

  async getShowStories(): Promise<number[]> {
    return this.request<number[]>('/showstories.json');
  }

  async getJobStories(): Promise<number[]> {
    return this.request<number[]>('/jobstories.json');
  }

  async getItem(id: number): Promise<Item> {
    return this.request<Item>(`/item/${id}.json`);
  }

  async getUser(username: string): Promise<User> {
    return this.request<User>(`/user/${username}.json`);
  }

  async getMaxItem(): Promise<number> {
    return this.request<number>('/maxitem.json');
  }

  async getUpdates(): Promise<Updates> {
    return this.request<Updates>('/updates.json');
  }

  // Helper: Get full stories from IDs
  async getStories(ids: number[], limit?: number): Promise<Item[]> {
    const storyIds = limit ? ids.slice(0, limit) : ids;
    return Promise.all(storyIds.map(id => this.getItem(id)));
  }
}

export default HackerNewsClient;
