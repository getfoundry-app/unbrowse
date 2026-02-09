const BASE_URL = 'https://api.adviceslip.com';

export class AdviceSlipClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getAdvice(): Promise<any> { return this.request('/advice'); }
  async getAdviceById(id: number): Promise<any> { return this.request(`/advice/${id}`); }
}

export default AdviceSlipClient;
