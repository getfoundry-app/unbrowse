const BASE_URL = 'https://api.exchangerate-api.com/v4';

export class ExchangeRateClient {
  async getLatest(currency: string): Promise<any> {
    const response = await fetch(`${BASE_URL}/latest/${currency}`);
    return response.json();
  }
}

export default ExchangeRateClient;
