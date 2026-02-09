const BASE_URL = 'https://randomuser.me/api';

export class RandomUserClient {
  async getUsers(count = 1): Promise<any> {
    const response = await fetch(`${BASE_URL}?results=${count}`);
    return response.json();
  }
}

export default RandomUserClient;
