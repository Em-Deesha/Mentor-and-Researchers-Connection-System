import { MentorshipRequest, MentorshipResponse } from '../types/mentorship';

// Use direct backend connection for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class MentorshipService {
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.detail || 'Request failed');
    }

    return response.json();
  }

  async getMentorship(request: MentorshipRequest): Promise<MentorshipResponse> {
    return this.makeRequest('/mentorship', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAgents(): Promise<Record<string, any>> {
    return this.makeRequest('/agents', {
      method: 'GET',
    });
  }

  async healthCheck(): Promise<any> {
    return this.makeRequest('/', {
      method: 'GET',
    });
  }
}

export const mentorshipService = new MentorshipService();
