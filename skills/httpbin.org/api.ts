/**
 * httpbin API Client
 * HTTP testing service
 */

const BASE_URL = 'https://httpbin.org';

export class HttpBinClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, options);
    if (!response.ok) throw new Error(`httpbin error: ${response.status}`);
    return response.json();
  }

  async get(params?: Record<string, string>): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/get${query}`);
  }

  async post(data?: any): Promise<any> {
    return this.request('/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async getIp(): Promise<{ origin: string }> {
    return this.request('/ip');
  }

  async getUserAgent(): Promise<{ 'user-agent': string }> {
    return this.request('/user-agent');
  }

  async getHeaders(): Promise<{ headers: Record<string, string> }> {
    return this.request('/headers');
  }

  async getStatus(code: number): Promise<any> {
    return this.request(`/status/${code}`);
  }

  async getUuid(): Promise<{ uuid: string }> {
    return this.request('/uuid');
  }
}

export default HttpBinClient;
