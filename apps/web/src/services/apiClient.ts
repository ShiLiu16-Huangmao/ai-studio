// @ai-radio/web — REST API client (mock for MVP)
// ===================================================================

const BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? 'Request failed');
  }
  return json.data;
}

export const apiClient = {
  /** POST /api/chat — Send message */
  sendMessage(text: string, conversationId?: string) {
    return request<{
      text: string;
      action: string | null;
      track: unknown | null;
      mood: unknown | null;
    }>('POST', '/chat', { text, conversationId });
  },

  /** GET /api/state — Get current state */
  getState() {
    return request<{
      dj: unknown;
      player: unknown;
      weather: unknown;
      uptime: number;
    }>('GET', '/state');
  },

  /** GET /api/health */
  health() {
    return request<{ status: string; uptime: number; version: string }>('GET', '/health');
  },
};
