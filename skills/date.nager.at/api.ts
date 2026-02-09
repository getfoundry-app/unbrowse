const BASE_URL = 'https://date.nager.at/api/v3';

export class NagerDateClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async getPublicHolidays(year: number, countryCode: string): Promise<any[]> {
    return this.request(`/publicholidays/${year}/${countryCode}`);
  }

  async getNextPublicHolidays(countryCode: string): Promise<any[]> {
    return this.request(`/nextpublicholidays/${countryCode}`);
  }

  async getAvailableCountries(): Promise<any[]> {
    return this.request('/availablecountries');
  }
}

export default NagerDateClient;
