/**
 * JSONPlaceholder API Client
 * Free fake REST API for testing and prototyping
 * https://jsonplaceholder.typicode.com
 */

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: { lat: string; lng: string };
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface Album {
  userId: number;
  id: number;
  title: string;
}

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export class JSONPlaceholderClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, options);
    if (!response.ok) {
      throw new Error(`JSONPlaceholder API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    return this.request<Post[]>('/posts');
  }

  async getPost(id: number): Promise<Post> {
    return this.request<Post>(`/posts/${id}`);
  }

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
  }

  async updatePost(id: number, post: Omit<Post, 'id'>): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
  }

  async patchPost(id: number, post: Partial<Post>): Promise<Post> {
    return this.request<Post>(`/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
  }

  async deletePost(id: number): Promise<void> {
    await this.request<void>(`/posts/${id}`, { method: 'DELETE' });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  // Comments
  async getComments(): Promise<Comment[]> {
    return this.request<Comment[]>('/comments');
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return this.request<Comment[]>(`/comments?postId=${postId}`);
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return this.request<Album[]>('/albums');
  }

  async getAlbum(id: number): Promise<Album> {
    return this.request<Album>(`/albums/${id}`);
  }

  // Todos
  async getTodos(): Promise<Todo[]> {
    return this.request<Todo[]>('/todos');
  }

  async getTodo(id: number): Promise<Todo> {
    return this.request<Todo>(`/todos/${id}`);
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return this.request<Photo[]>('/photos');
  }

  async getPhoto(id: number): Promise<Photo> {
    return this.request<Photo>(`/photos/${id}`);
  }
}

export default JSONPlaceholderClient;
