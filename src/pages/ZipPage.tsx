import { useState, useEffect } from 'react';
import { getBaseUrl } from '../api';

interface ZipPageProps {
  userId: string;
  initialZip: string;
  isUpdate: boolean;
  onSuccess: (zip: string) => void;
}

export function ZipPage({ userId, initialZip, isUpdate, onSuccess }: ZipPageProps) {
  const [zipInput, setZipInput] = useState(initialZip);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setZipInput(initialZip);
  }, [initialZip]);

  const baseUrl = getBaseUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = zipInput.trim();
    if (!/^\d{5}$/.test(value)) {
      setError('Zip must be exactly 5 numbers');
      return;
    }
    setSubmitting(true);
    try {
      const body = JSON.stringify({ zip: value, userId });
      const method = isUpdate ? 'PUT' : 'POST';
      const res = await fetch(`${baseUrl}/zip`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body,
      });
      if (!res.ok) {
        setError(res.statusText || 'Failed to save zip');
        return;
      }
      onSuccess(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>{isUpdate ? 'Update your zip code' : 'Enter your zip code'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Zip code
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
            placeholder="12345"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
