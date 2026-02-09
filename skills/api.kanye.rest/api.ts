const BASE_URL = 'https://api.kanye.rest';

export class KanyeRestClient {
  async getQuote(): Promise<{ quote: string }> {
    const response = await fetch(BASE_URL);
    return response.json();
  }
}

export default KanyeRestClient;
