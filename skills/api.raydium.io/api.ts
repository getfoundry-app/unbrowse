const BASE_URL = 'https://api.raydium.io/v2';

export class RaydiumClient {
  async getPairs(): Promise<any> {
    const response = await fetch(`${BASE_URL}/main/pairs`);
    return response.json();
  }
}

export default RaydiumClient;
