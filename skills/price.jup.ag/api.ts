const BASE_URL = 'https://price.jup.ag/v6';

export class JupiterPriceClient {
  async getPrice(ids: string[]): Promise<any> {
    const response = await fetch(`${BASE_URL}/price?ids=${ids.join(',')}`);
    return response.json();
  }

  async getQuote(inputMint: string, outputMint: string, amount: number): Promise<any> {
    const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}`;
    const response = await fetch(url);
    return response.json();
  }
}

export default JupiterPriceClient;
