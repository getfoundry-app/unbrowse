const BASE_URL = 'https://api.mainnet-beta.solana.com';

export class SolanaRPCClient {
  private endpoint: string;

  constructor(endpoint = BASE_URL) {
    this.endpoint = endpoint;
  }

  private async request(method: string, params: any[] = []): Promise<any> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(`Solana RPC error: ${data.error.message}`);
    return data.result;
  }

  async getBalance(publicKey: string): Promise<any> {
    return this.request('getBalance', [publicKey]);
  }

  async getAccountInfo(publicKey: string): Promise<any> {
    return this.request('getAccountInfo', [publicKey, { encoding: 'jsonParsed' }]);
  }

  async getBlockHeight(): Promise<number> {
    return this.request('getBlockHeight');
  }

  async getLatestBlockhash(): Promise<any> {
    return this.request('getLatestBlockhash');
  }

  async getTransaction(signature: string): Promise<any> {
    return this.request('getTransaction', [signature, { encoding: 'jsonParsed' }]);
  }
}

export default SolanaRPCClient;
