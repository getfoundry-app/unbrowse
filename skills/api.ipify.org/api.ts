const BASE_URL = 'https://api.ipify.org';

export class IpifyClient {
  async getIp(): Promise<{ ip: string }> {
    const response = await fetch(`${BASE_URL}?format=json`);
    return response.json();
  }
}

export default IpifyClient;
