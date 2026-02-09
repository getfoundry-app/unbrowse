const BASE_URL = 'https://blockchain.info';

export class BlockchainInfoClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getStats(): Promise<any> {
    return this.request('/stats');
  }

  async getRawBlock(hash: string): Promise<any> {
    return this.request(`/rawblock/${hash}`);
  }

  async getRawTx(hash: string): Promise<any> {
    return this.request(`/rawtx/${hash}`);
  }
}

export default BlockchainInfoClient;
