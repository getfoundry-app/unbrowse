const BASE_URL = 'https://api.agify.io';

export class AgifyClient {
  async predictAge(name: string): Promise<{ name: string; age: number; count: number }> {
    const response = await fetch(`${BASE_URL}?name=${encodeURIComponent(name)}`);
    return response.json();
  }
}

export default AgifyClient;
