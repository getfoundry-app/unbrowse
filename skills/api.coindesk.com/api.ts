const BASE_URL = 'https://api.coindesk.com/v1/bpi';

export class CoinDeskClient {
  async getCurrentPrice(): Promise<any> {
    const response = await fetch(`${BASE_URL}/currentprice.json`);
    return response.json();
  }
}

export default CoinDeskClient;
