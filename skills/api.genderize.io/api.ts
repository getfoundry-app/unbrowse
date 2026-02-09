const BASE_URL = 'https://api.genderize.io';

export class GenderizeClient {
  async predictGender(name: string): Promise<{ name: string; gender: string; probability: number; count: number }> {
    const response = await fetch(`${BASE_URL}?name=${encodeURIComponent(name)}`);
    return response.json();
  }
}

export default GenderizeClient;
