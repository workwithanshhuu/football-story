const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "https://72f7vsw2ai.execute-api.ap-south-1.amazonaws.com/v1";

type TokenPair = { accessToken: string; refreshToken: string };

type ApiError = { code?: string; message?: string };

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export type User = {
  id: string;
  displayName: string | null;
  photoUrl: string | null;
  city: string | null;
  area: string | null;
  positions: string[];
  primaryPositionCode: string | null;
  roles: string[];
};

export type Match = {
  id: string;
  format: { code: string };
  venue: { name: string };
  scheduledAt: string;
  status: string;
  costPerHead: number | null;
  teams: Array<{ side: "home" | "away"; name: string }>;
  playersJoined: number;
  playersNeeded: number;
};

export type MatchListPage = { items: Match[]; nextCursor: string | null };

export type Format = {
  id: string;
  code: string;
  playersPerSide: number;
  defaultDurationMinutes: number;
  defaultPeriods: number;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    let code: string | undefined;
    try {
      const error = (await response.json()) as ApiError;
      if (error.message) message = error.message;
      code = error.code;
    } catch {
      // Keep the status-based message when the backend does not return JSON.
    }
    throw new ApiRequestError(message, response.status, code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function loginWithEmail(email: string, password: string) {
  return request<TokenPair>("/auth/login-email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerWithEmail(email: string, password: string, displayName: string) {
  return request<TokenPair>("/auth/register-email", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName }),
  });
}

export function getCurrentUser(accessToken: string) {
  return request<User>("/users/me", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

export function listMatches(accessToken: string) {
  return request<MatchListPage>("/matches?status=open&pageSize=5", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

export function listFormats(accessToken?: string) {
  return request<Format[]>("/formats", {
    headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
  });
}

export function createMatch(accessToken: string, body: Record<string, unknown>) {
  return request<Match>("/matches", {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
}

export function createTeam(
  accessToken: string,
  matchId: string,
  side: "home" | "away",
  name: string,
) {
  return request<{ id: string }>(`/matches/${matchId}/teams`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ side, name }),
  });
}

export function addSquadMember(
  accessToken: string,
  matchId: string,
  teamId: string,
  body: Record<string, unknown>,
) {
  return request(`/matches/${matchId}/teams/${teamId}/squad-members`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  });
}

export function publishMatch(accessToken: string, matchId: string) {
  return request<Match>(`/matches/${matchId}/publish`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
  });
}
