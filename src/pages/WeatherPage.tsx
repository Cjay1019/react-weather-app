import type { WeatherResponse } from '../types';

interface WeatherPageProps {
  weather: WeatherResponse | null;
  loading: boolean;
  error: string | null;
  onChangeLocation: () => void;
}

export function WeatherPage({ weather, loading, error, onChangeLocation }: WeatherPageProps) {
  return (
    <div className="container">
      {loading && <p>Loading weather…</p>}
      {error && <p className="error">{error}</p>}
      {weather && (
        <>
          <section className="weather-card">
            <h1>Today&apos;s weather in {weather.location}</h1>
            <p className="summary">{weather.summary}</p>
            <p>High: {weather.high}°F</p>
            <p>Low {weather.low}°F</p>
          </section>
          <button type="button" className="change-location-button" onClick={onChangeLocation}>
            Change Location
          </button>
        </>
      )}
    </div>
  );
}
