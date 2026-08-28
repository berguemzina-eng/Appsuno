/**
 * api.ts - Cliente HTTP para el backend de Moroccan AI Music Generator.
 *
 * Cambia API_BASE_URL por la URL de tu backend desplegado
 * (Hugging Face Spaces, Render, Railway, etc.) o déjala en localhost
 * para desarrollo local.
 */

export const API_BASE_URL = 'https://appsuno.onrender.com';

export type GenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface GenerateParams {
  prompt: string;
  style?: string;
  duration?: number;
  includeVoice?: boolean;
  voice?: 'male' | 'female';
  voiceText?: string;
  temperature?: number;
  seed?: number;
}

export interface GenerateResponse {
  id: string;
  status: GenerationStatus;
  message: string;
}

export interface StatusResponse {
  id: string;
  status: GenerationStatus;
  prompt?: string;
  style?: string;
  duration?: number;
  audio_url?: string;
  error?: string;
  created_at?: number;
}

export interface LibraryItem {
  id: string;
  status: GenerationStatus;
  prompt?: string;
  style?: string;
  created_at?: number;
  duration?: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  getStyles: () => request<{ styles: string[] }>('/styles'),

  getVoices: () => request<{ voices: string[] }>('/voices'),

  generate: (params: GenerateParams) =>
    request<GenerateResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        style: p
