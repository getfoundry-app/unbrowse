const BASE_URL = 'https://api.helius.xyz/v0';

export class HeliusClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${BASE_URL}${path}${path.includes('?') ? '&' : '?'}api-key=${this.apiKey}`;
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Helius API error: ${response.status}`);
    return response.json();
  }

  async getTransactions(address: string): Promise<any> {
    return this.request(`/addresses/${address}/transactions`, { method: 'POST' });
  }

  async getBalances(address: string): Promise<any> {
    return this.request(`/addresses/${address}/balances`);
  }

  async rpcRequest(method: string, params: any[]): Promise<any> {
    const response = await fetch(`https://rpc.helius.xyz/?api-key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const data = await response.json();
    if (data.error) throw new Error(`Helius RPC error: ${data.error.message}`);
    return data.result;
  }
}

export default HeliusClient;
