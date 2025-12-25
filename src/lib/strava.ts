import type {
  StravaTokenResponse,
  StravaActivity,
  ProgressCallback,
} from '$lib/types';

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
    options?: {
      before?: number;
      after?: number;
      per_page?: number;
    }
  ): Promise<StravaActivity[]> {
    const queryParams = new URLSearchParams({
      per_page: String(options?.per_page ?? 100),
    });

    if (options?.before) {
      queryParams.append('before', String(options.before));
    }

    if (options?.after) {
      queryParams.append('after', String(options.after));
    }

    try {
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?${queryParams}`,
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

  /**
   * Fetches activities with automatic chunking, retry logic, and progress updates.
   * Splits large date ranges into 3-month chunks to avoid API timeouts.
   */
  public async getActivitiesWithChunking(
    accessToken: string,
    options?: {
      before?: number;
      after?: number;
      per_page?: number;
    },
    onProgress?: ProgressCallback
  ): Promise<StravaActivity[]> {
    const CHUNK_DURATION = 90 * 24 * 60 * 60; // 3 months in seconds
    const MAX_PER_PAGE = 200;

    let allActivities: StravaActivity[] = [];

    // If no date range specified, just fetch once with per_page limit
    if (!options?.after && !options?.before) {
      onProgress?.({
        currentChunk: 1,
        totalChunks: 1,
        activitiesFetched: 0,
        message: 'Collecting activities from Strava...',
      });

      const activities = await this.fetchWithRetry(accessToken, {
        per_page: Math.min(options?.per_page ?? MAX_PER_PAGE, MAX_PER_PAGE),
      });

      onProgress?.({
        currentChunk: 1,
        totalChunks: 1,
        activitiesFetched: activities.length,
        message: `Successfully fetched ${activities.length} activities!`,
      });

      return activities;
    }

    // Calculate time-based chunks
    const endTime = options?.before ?? Math.floor(Date.now() / 1000);
    const startTime = options?.after ?? endTime - 365 * 24 * 60 * 60; // Default 1 year

    // Calculate total chunks
    const totalDuration = endTime - startTime;
    const estimatedChunks = Math.ceil(totalDuration / CHUNK_DURATION);

    console.log('Chunking setup:', {
      startTime: new Date(startTime * 1000).toISOString(),
      endTime: new Date(endTime * 1000).toISOString(),
      totalDuration: totalDuration / (24 * 60 * 60),
      estimatedChunks,
    });

    let currentChunkStart = startTime;
    let currentChunkNumber = 0;

    // Fetch chunks sequentially
    while (currentChunkStart < endTime) {
      currentChunkNumber++;
      const currentChunkEnd = Math.min(
        currentChunkStart + CHUNK_DURATION,
        endTime
      );

      // Update progress
      onProgress?.({
        currentChunk: currentChunkNumber,
        totalChunks: estimatedChunks,
        activitiesFetched: allActivities.length,
        message: 'Collecting activities from Strava...',
      });

      try {
        console.log(`Fetching chunk ${currentChunkNumber}:`, {
          from: new Date(currentChunkStart * 1000).toISOString(),
          to: new Date(currentChunkEnd * 1000).toISOString(),
        });

        // Fetch this chunk with retry logic
        const chunkActivities = await this.fetchWithRetry(accessToken, {
          after: currentChunkStart,
          before: currentChunkEnd,
          per_page: MAX_PER_PAGE,
        });

        console.log(`Chunk ${currentChunkNumber} returned ${chunkActivities.length} activities`);

        // Prepend chunk activities to maintain newest-first order
        // (since we fetch oldest chunks first, but Strava returns newest-first within each chunk)
        allActivities = [...chunkActivities, ...allActivities];

        console.log(`Total activities so far: ${allActivities.length}`);

        // Move to next chunk (continue through entire date range)
        currentChunkStart = currentChunkEnd;
        console.log(`Next chunk will start at: ${new Date(currentChunkStart * 1000).toISOString()}`);
      } catch (error) {
        // If chunk fails after retries, throw with context
        throw new Error(
          `Failed to fetch activities (chunk ${currentChunkNumber} of ${estimatedChunks}): ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log('Chunking complete. Loop ended with:', {
      currentChunkStart: new Date(currentChunkStart * 1000).toISOString(),
      endTime: new Date(endTime * 1000).toISOString(),
      totalActivities: allActivities.length,
      chunksProcessed: currentChunkNumber,
    });

    // Final progress update
    onProgress?.({
      currentChunk: currentChunkNumber,
      totalChunks: currentChunkNumber,
      activitiesFetched: allActivities.length,
      message: `Successfully fetched ${allActivities.length} activities!`,
    });

    return allActivities;
  }

  /**
   * Fetches activities with exponential backoff retry logic.
   * Handles rate limits, server errors, and transient network issues.
   */
  private async fetchWithRetry(
    accessToken: string,
    options: {
      before?: number;
      after?: number;
      per_page?: number;
    },
    maxRetries: number = 3
  ): Promise<StravaActivity[]> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Build query params
        const queryParams = new URLSearchParams({
          per_page: String(options?.per_page ?? 100),
        });

        if (options?.before) {
          queryParams.append('before', String(options.before));
        }

        if (options?.after) {
          queryParams.append('after', String(options.after));
        }

        // Make request
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Handle authentication errors immediately (don't retry)
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            'Authentication failed. Please reconnect to Strava.'
          );
        }

        // Handle bad requests immediately (don't retry)
        if (response.status === 400) {
          throw new Error('Invalid request parameters.');
        }

        // Handle rate limit with backoff
        if (response.status === 429) {
          if (attempt >= maxRetries) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }

          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : Math.pow(2, attempt) * 1000; // Exponential: 1s, 2s, 4s

          console.warn(
            `Rate limited. Waiting ${waitTime / 1000}s before retry...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue; // Retry
        }

        // Handle server errors with backoff
        if (response.status >= 500) {
          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000;
            console.warn(`Server error. Retrying in ${waitTime / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error('Strava server error. Please try again later.');
        }

        // Check for success
        if (!response.ok) {
          throw new Error(
            `Failed to fetch activities: ${response.statusText}`
          );
        }

        // Parse and return activities
        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on auth or validation errors
        if (
          lastError.message.includes('Authentication') ||
          lastError.message.includes('Invalid request')
        ) {
          throw lastError;
        }

        // If this was our last attempt, break and throw
        if (attempt === maxRetries) {
          break;
        }

        // Otherwise log and continue to next retry
        console.warn(`Attempt ${attempt + 1} failed:`, lastError.message);
      }
    }

    // All retries exhausted
    throw new Error(
      `Failed after ${maxRetries} retries: ${lastError?.message ?? 'Unknown error'}`
    );
  }
}
