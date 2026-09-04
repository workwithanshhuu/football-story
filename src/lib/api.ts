const API_BASE_URL = "https://72f7vsw2ai.execute-api.ap-south-1.amazonaws.com/v1";

type TokenPair = { accessToken: string; refreshToken: string };

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
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function loginWithEmail(email: string, password: string) {
  return request<TokenPair>("/auth/login-email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerWithEmail(email: string, password: string) {
  return request<TokenPair>("/auth/register-email", {
    method: "POST",
    body: JSON.stringify({ email, password }),
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

export function listFormats() {
  return request<Format[]>("/formats");
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
