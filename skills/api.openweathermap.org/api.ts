const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class OpenWeatherClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    if (!response.ok) throw new Error(`OpenWeather API error: ${response.status}`);
    return response.json();
  }

  async getCurrentWeather(city: string, units = 'metric'): Promise<any> {
    return this.request(`/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${units}`);
  }

  async getForecast(city: string, units = 'metric'): Promise<any> {
    return this.request(`/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${units}`);
  }

  async getWeatherByCoords(lat: number, lon: number, units = 'metric'): Promise<any> {
    return this.request(`/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}`);
  }
}

export default OpenWeatherClient;
