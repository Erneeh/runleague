const STRAVA_BASE_URL = "https://www.strava.com/api/v3";

function getStravaEnv() {
  const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.NEXT_PUBLIC_STRAVA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Strava environment variables are not set. Please configure NEXT_PUBLIC_STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, and NEXT_PUBLIC_STRAVA_REDIRECT_URI."
    );
  }

  return { clientId, clientSecret, redirectUri };
}

export function getStravaAuthorizeUrl() {
  const { clientId, redirectUri } = getStravaEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    approval_prompt: "auto",
    scope: "read,activity:read_all,profile:read_all",
  });

  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeStravaToken(code: string) {
  const { clientId, clientSecret, redirectUri } = getStravaEnv();

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange Strava token");
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number };
  }>;
}

export async function refreshStravaToken(refreshToken: string) {
  const { clientId, clientSecret } = getStravaEnv();

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
  }>;
}

export async function fetchStravaActivities(accessToken: string) {
  const res = await fetch(
    `${STRAVA_BASE_URL}/athlete/activities?per_page=50&page=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Strava activities");
  }

  return res.json() as Promise<
    Array<{
      id: number;
      name: string;
      type: string;
      distance: number; // meters
      moving_time: number; // seconds
      total_elevation_gain: number;
      start_date_local: string;
    }>
  >;
}

