const BASE_URL = 'https://api.nationalize.io';

export class NationalizeClient {
  async predictNationality(name: string): Promise<any> {
    const response = await fetch(`${BASE_URL}?name=${encodeURIComponent(name)}`);
    return response.json();
  }
}

export default NationalizeClient;
