import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export type AuthStateListener = () => void;

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly TOKEN_KEY = "bio-tracker-access-token";
  private authStateListeners: AuthStateListener[] = [];

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.clearToken();
          this.notifyAuthStateListeners();
        }
        return Promise.reject(error);
      }
    );
  }

  /** Subscribe to session changes (token set/cleared, 401). Used by AuthRepository for onAuthStateChange. */
  addAuthStateListener(listener: AuthStateListener): () => void {
    this.authStateListeners.push(listener);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }

  private notifyAuthStateListeners(): void {
    this.authStateListeners.forEach(l => l());
  }

  public async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  public setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.notifyAuthStateListeners();
  }

  public clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.notifyAuthStateListeners();
  }

  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
