const BASE_URL = 'https://token.jup.ag';

export class JupiterTokenClient {
  async getStrictTokens(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/strict`);
    return response.json();
  }

  async getAllTokens(): Promise<any[]> {
    const response = await fetch(`${BASE_URL}/all`);
    return response.json();
  }
}

export default JupiterTokenClient;
