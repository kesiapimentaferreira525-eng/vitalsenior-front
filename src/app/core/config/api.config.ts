import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    __VITALSENIOR_ENV__?: { apiUrl?: string };
  }
}

/** Prefixo REST de todos os endpoints do backend. */
export const API_PREFIX = '/api/v1';

/**
 * Resolve a URL base da API:
 * 1) `public/env.js` (editável no deploy, sem rebuild)
 * 2) `environment*.ts`
 */
export function resolverApiBaseUrl(): string {
  const runtime = typeof window !== 'undefined' ? window.__VITALSENIOR_ENV__?.apiUrl : undefined;
  const base = (runtime && runtime.trim()) || environment.apiUrl;
  return base.replace(/\/+$/, '') + API_PREFIX;
}

/** URL base completa, ex.: http://localhost:8080/api/v1 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: resolverApiBaseUrl,
});
