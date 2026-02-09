/**
 * GitHub REST API Client
 * https://api.github.com
 * 
 * Rate limits:
 * - Unauthenticated: 60 requests/hour
 * - Authenticated: 5,000 requests/hour
 */

const BASE_URL = 'https://api.github.com';

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  type: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at?: string;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  owner: User;
  private: boolean;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  topics?: string[];
}

export interface Issue {
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  state: 'open' | 'closed';
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string;
  labels: Label[];
}

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

export interface Commit {
  sha: string;
  node_id: string;
  commit: {
    author: GitUser;
    committer: GitUser;
    message: string;
    tree: { sha: string; url: string };
  };
  author: User | null;
  committer: User | null;
  parents: { sha: string; url: string }[];
}

export interface GitUser {
  name: string;
  email: string;
  date: string;
}

export interface SearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export class GitHubClient {
  private baseURL: string;
  private token?: string;

  constructor(token?: string, baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      ...(options?.headers || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Users
  async getUser(username: string): Promise<User> {
    return this.request<User>(`/users/${username}`);
  }

  async getUserRepos(username: string, params?: {
    sort?: 'created' | 'updated' | 'pushed' | 'full_name';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<Repository[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Repository[]>(`/users/${username}/repos${query ? '?' + query : ''}`);
  }

  // Repositories
  async getRepo(owner: string, repo: string): Promise<Repository> {
    return this.request<Repository>(`/repos/${owner}/${repo}`);
  }

  async getRepoIssues(owner: string, repo: string, params?: {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<Issue[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Issue[]>(`/repos/${owner}/${repo}/issues${query ? '?' + query : ''}`);
  }

  async getRepoIssue(owner: string, repo: string, issueNumber: number): Promise<Issue> {
    return this.request<Issue>(`/repos/${owner}/${repo}/issues/${issueNumber}`);
  }

  async getRepoCommits(owner: string, repo: string, params?: {
    sha?: string;
    path?: string;
    per_page?: number;
    page?: number;
  }): Promise<Commit[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request<Commit[]>(`/repos/${owner}/${repo}/commits${query ? '?' + query : ''}`);
  }

  async getRepoReadme(owner: string, repo: string): Promise<any> {
    return this.request<any>(`/repos/${owner}/${repo}/readme`);
  }

  // Search
  async searchRepositories(query: string, params?: {
    sort?: 'stars' | 'forks' | 'updated';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<SearchResult<Repository>> {
    const searchParams = new URLSearchParams({ q: query, ...(params as any) }).toString();
    return this.request<SearchResult<Repository>>(`/search/repositories?${searchParams}`);
  }

  async searchUsers(query: string, params?: {
    sort?: 'followers' | 'repositories' | 'joined';
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<SearchResult<User>> {
    const searchParams = new URLSearchParams({ q: query, ...(params as any) }).toString();
    return this.request<SearchResult<User>>(`/search/users?${searchParams}`);
  }
}

export default GitHubClient;
