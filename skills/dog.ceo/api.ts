const BASE_URL = 'https://dog.ceo/api';

export class DogCEOClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getAllBreeds(): Promise<any> {
    return this.request('/breeds/list/all');
  }

  async getRandomImage(): Promise<{ message: string; status: string }> {
    return this.request('/breeds/image/random');
  }

  async getBreedImages(breed: string, count = 1): Promise<any> {
    return this.request(`/breed/${breed}/images/random/${count}`);
  }
}

export default DogCEOClient;
