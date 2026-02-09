const BASE_URL = 'https://openlibrary.org';

export class OpenLibraryClient {
  private async request<T>(path: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.json();
  }

  async search(query: string): Promise<any> {
    return this.request(`/search.json?q=${encodeURIComponent(query)}`);
  }

  async getBookByISBN(isbn: string): Promise<any> {
    return this.request(`/api/books?bibkeys=ISBN:${isbn}&format=json`);
  }
}

export default OpenLibraryClient;
