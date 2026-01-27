export interface RegisterResponse {
  id: string;
}

export interface LoginResponse {
  id: string;
  zip?: string;
}

export interface WeatherResponse {
  location: string;
  high: number;
  low: number;
  summary: string;
}
