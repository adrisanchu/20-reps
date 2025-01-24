import type { StravaTokenResponse, StravaActivity } from '$lib/types';

export class Strava {
  private clientId: string;
  private clientSecret: string;
  public redirectUri: string;
  public temporaryCode: string = '';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = import.meta.env.VITE_REDIRECT_URI; // Update depending on devel or prod
  }

  public getAuthorizeUrl(): URL {
    const authUrl = new URL('https://www.strava.com/oauth/authorize');
    authUrl.searchParams.append('client_id', this.clientId);
    authUrl.searchParams.append('redirect_uri', this.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append(
      'scope',
      'read,read_all,profile:read_all,activity:read,activity:read_all'
    );
    return authUrl;
  }

  public async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: this.temporaryCode,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = (await response.json()) as StravaTokenResponse;
      return data.access_token;
    } catch (error) {
      console.error('Error fetching Strava access token:', error);
      throw error;
    }
  }

  public async getActivities(
    accessToken: string,
    after: number
  ): Promise<StravaActivity[]> {
    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Strava activities:', error);
      throw error;
    }
  }

  public async getAthlete(accessToken: string): Promise<StravaActivity> {
    try {
      const response = await fetch(`https://www.strava.com/api/v3/athlete`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch athlete');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Strava athlete:', error);
      throw error;
    }
  }
}
