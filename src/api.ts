export function getBaseUrl(): string {
  if (import.meta.env.DEV) {
    return (import.meta.env.VITE_API_BASE_URL_LOCAL || 'http://localhost:7071/api').replace(/\/$/, '');
  }
  const url = import.meta.env.VITE_API_BASE_URL;
  if (!url) throw new Error('VITE_API_BASE_URL is not set in .env');
  return url.replace(/\/$/, '');
}
