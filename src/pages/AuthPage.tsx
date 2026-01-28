import { useState } from 'react';
import { getBaseUrl } from '../api';
import type { RegisterResponse, LoginResponse } from '../types';

interface AuthPageProps {
  onSuccess: (id: string, zip?: string) => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const baseUrl = getBaseUrl();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        const res = await fetch(`${baseUrl}/user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          if (res.status === 500) {
            setError('The server is temporarily unavailable. The database may be spinning back up—please wait one minute and try again.');
          } else {
            setError(res.statusText || 'Registration failed');
          }
          return;
        }
        const data: RegisterResponse = await res.json();
        if (data.id) {
          onSuccess(data.id);
        } else {
          setError('Invalid response: no user id returned');
        }
      } else {
        const res = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (!res.ok) {
          if (res.status === 500) {
            setError('The server is temporarily unavailable. The database may be spinning back up—please wait one minute and try again.');
          } else {
            setError(res.statusText || 'Login failed');
          }
          return;
        }
        const data: LoginResponse = await res.json();
        if (data.id) {
          onSuccess(data.id, data.zip);
        } else {
          setError('Invalid response: no user id returned');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>{isRegister ? 'Create account' : 'Log in'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            maxLength={100}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            maxLength={100}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {isRegister ? 'Register' : 'Log in'}
        </button>
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setIsRegister((v) => !v);
            setError(null);
          }}
        >
          {isRegister ? 'Already have an account? Log in' : 'Need an account? Register'}
        </button>
      </form>
    </div>
  );
}
