import { useState, useEffect } from 'react';
import { getBaseUrl } from './api';
import { AuthPage } from './pages/AuthPage';
import { ZipPage } from './pages/ZipPage';
import { WeatherPage } from './pages/WeatherPage';
import type { WeatherResponse } from './types';
import './App.css';

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [zip, setZip] = useState<string | null>(null);
  const [showZipForm, setShowZipForm] = useState(false);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const baseUrl = getBaseUrl();

  const loadWeather = async (zipCode: string) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const res = await fetch(`${baseUrl}/weatherforecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zip: zipCode }),
      });
      if (!res.ok) {
        setWeatherError(res.statusText || 'Failed to load weather');
        return;
      }
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch (err) {
      setWeatherError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!zip || weather != null || weatherLoading) return;
    loadWeather(zip);
  }, [zip]);

  if (userId == null) {
    return (
      <AuthPage
        onSuccess={(id, zipFromLogin) => {
          setUserId(id);
          if (zipFromLogin) setZip(zipFromLogin);
        }}
      />
    );
  }

  if (!zip || showZipForm) {
    return (
      <ZipPage
        userId={userId}
        initialZip={showZipForm ? zip ?? '' : ''}
        isUpdate={showZipForm}
        onSuccess={(newZip) => {
          setZip(newZip);
          setShowZipForm(false);
          setWeather(null);
          loadWeather(newZip);
        }}
      />
    );
  }

  return (
    <WeatherPage
      weather={weather}
      loading={weatherLoading && !weather}
      error={weatherError}
      onChangeLocation={() => setShowZipForm(true)}
    />
  );
}

export default App;
