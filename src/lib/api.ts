/**
 * API Client Utility
 * Path: src/lib/api.ts
 * 
 * Centralized API client for making consistent requests to the backend
 */

import { 
  ApiResponse, 
  ApiErrorCode,
  Campaign,
  GameSession,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignListResponse,
  CreateCampaignResponse,
  SessionListResponse,
  ProcessingStatus,
} from '@/types/api'

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * API client configuration
 */
const API_BASE_URL = '/api'

/**
 * Make an API request with consistent error handling
 */
async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const result: ApiResponse<T> = await response.json()

    if (!response.ok || !result.success) {
      throw new ApiError(
        result.error?.code || ApiErrorCode.INTERNAL_ERROR,
        result.error?.message || 'An error occurred',
        result.error?.details
      )
    }

    return result.data!
  } catch (error) {
    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    throw new ApiError(
      ApiErrorCode.INTERNAL_ERROR,
      error instanceof Error ? error.message : 'Network error'
    )
  }
}

/**
 * Campaign API methods
 */
export const campaignApi = {
  /**
   * List all campaigns for the current user
   */
  async list(params?: {
    limit?: number
    offset?: number
    role?: 'owner' | 'dm' | 'player'
  }): Promise<CampaignListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.role) searchParams.set('role', params.role)
    
    return apiRequest<CampaignListResponse>(
      `/campaigns${searchParams.toString() ? `?${searchParams}` : ''}`
    )
  },

  /**
   * Get a specific campaign
   */
  async get(id: string): Promise<Campaign> {
    return apiRequest<Campaign>(`/campaigns/${id}`)
  },

  /**
   * Create a new campaign
   */
  async create(data: CreateCampaignRequest): Promise<CreateCampaignResponse> {
    return apiRequest<CreateCampaignResponse>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update a campaign
   */
  async update(id: string, data: UpdateCampaignRequest): Promise<Campaign> {
    return apiRequest<Campaign>(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a campaign
   */
  async delete(id: string): Promise<void> {
    await apiRequest(`/campaigns/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Generate a new invite code
   */
  async generateInviteCode(id: string): Promise<{ inviteCode: string }> {
    return apiRequest<{ inviteCode: string }>(`/campaigns/${id}/invite`, {
      method: 'POST',
    })
  },

  /**
   * Join a campaign with invite code
   */
  async join(inviteCode: string, characterName?: string): Promise<{ campaignId: string; role: string }> {
    return apiRequest('/campaigns/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode, characterName }),
    })
  },
}

/**
 * Session API methods
 */
export const sessionApi = {
  /**
   * List sessions for a campaign
   */
  async list(campaignId: string, params?: {
    limit?: number
    offset?: number
  }): Promise<SessionListResponse> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    
    return apiRequest<SessionListResponse>(
      `/campaigns/${campaignId}/sessions${searchParams.toString() ? `?${searchParams}` : ''}`
    )
  },

  /**
   * Get a specific session
   */
  async get(id: string): Promise<GameSession> {
    return apiRequest<GameSession>(`/sessions/${id}`)
  },

  /**
   * Upload a new session audio file
   */
  async upload(campaignId: string, audioFile: File, metadata?: {
    sessionDate?: string
    sessionNumber?: number
  }): Promise<GameSession> {
    const formData = new FormData()
    formData.append('audioFile', audioFile)
    if (metadata?.sessionDate) formData.append('sessionDate', metadata.sessionDate)
    if (metadata?.sessionNumber) formData.append('sessionNumber', metadata.sessionNumber.toString())

    const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/sessions`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    })

    const result: ApiResponse<GameSession> = await response.json()

    if (!response.ok || !result.success) {
      throw new ApiError(
        result.error?.code || ApiErrorCode.INTERNAL_ERROR,
        result.error?.message || 'Upload failed'
      )
    }

    return result.data!
  },

  /**
   * Get processing status for a session
   */
  async getStatus(id: string): Promise<ProcessingStatus> {
    return apiRequest<ProcessingStatus>(`/sessions/${id}/status`)
  },

  /**
   * Retry failed processing
   */
  async retry(id: string): Promise<void> {
    await apiRequest(`/sessions/${id}/retry`, {
      method: 'POST',
    })
  },

  /**
   * Delete a session
   */
  async delete(id: string): Promise<void> {
    await apiRequest(`/sessions/${id}`, {
      method: 'DELETE',
    })
  },
}

/**
 * User API methods
 */
export const userApi = {
  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    return apiRequest<User>('/user/me')
  },

  /**
   * Update user settings
   */
  async updateSettings(settings: Partial<UserSettings>): Promise<User> {
    return apiRequest<User>('/user/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },
}

/**
 * Convenience export of all API methods
 */
export const api = {
  campaigns: campaignApi,
  sessions: sessionApi,
  user: userApi,
}