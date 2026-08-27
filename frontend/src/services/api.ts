/**
 * api.ts - Cliente HTTP para el backend de Moroccan AI Music Generator.
 *
 * Cambia API_BASE_URL por la URL de tu backend desplegado
 * (Hugging Face Spaces, Render, Railway, etc.) o déjala en localhost
 * para desarrollo local.
 */

export const API_BASE_URL = 'http://localhost:7860';

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
        style: params.style,
        duration: params.duration ?? 30,
        include_voice: params.includeVoice ?? false,
        voice: params.voice ?? 'female',
        voice_text: params.voiceText,
        temperature: params.temperature ?? 1.0,
        seed: params.seed,
      }),
    }),

  getStatus: (id: string) => request<StatusResponse>(`/api/status/${id}`),

  getDownloadUrl: (id: string) => `${API_BASE_URL}/api/download/${id}`,

  regenerate: (id: string) =>
    request<GenerateResponse>(`/api/regenerate/${id}`, { method: 'POST' }),

  getLibrary: (limit = 50) =>
    request<{ items: LibraryItem[] }>(`/api/library?limit=${limit}`),

  /**
   * Hace polling del estado de una generación hasta que termine o falle.
   */
  pollUntilDone: async (
    id: string,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
  ): Promise<StatusResponse> => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const status = await api.getStatus(id);
      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error('Tiempo de espera agotado generando la música');
  },
};

export default api;
