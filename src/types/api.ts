/**
 * API Types and Interfaces
 * Path: src/types/api.ts
 * 
 * Centralized type definitions for API responses and data structures
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number
  hasMore: boolean
}

/**
 * User types
 */
export interface User {
  id: string
  email: string
  username: string | null
  image: string | null
  discordId: string
  settings?: UserSettings
}

export interface UserSettings {
  emailNotifications?: boolean
  discordNotifications?: boolean
  defaultCampaignSettings?: {
    isPublic: boolean
  }
}

/**
 * Campaign types
 */
export interface Campaign {
  id: string
  name: string
  description: string | null
  worldPrimer: string
  settingNotes: string | null
  playerCharacterMapping: Record<string, string>
  isPublic: boolean
  inviteCode: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  // Relations
  owner?: CampaignOwner
  memberCount?: number
  sessionCount?: number
  lastSessionAt?: string | null
  userRole?: CampaignRole
}

export interface CampaignOwner {
  id: string
  username: string | null
  image: string | null
}

export enum CampaignRole {
  OWNER = 'OWNER',
  DM = 'DM',
  PLAYER = 'PLAYER',
  MEMBER = 'MEMBER',
}

/**
 * Session types
 */
export interface GameSession {
  id: string
  campaignId: string
  sessionNumber: number | null
  sessionDate: string | null
  audioFileUrl: string | null
  transcriptFileUrl: string | null
  summary: string | null
  tldr: string[]
  keyEvents: string[]
  npcsEncountered: string[]
  locationsVisited: string[]
  lootObtained: string[]
  status: SessionStatus
  processingStartedAt: string | null
  processingCompletedAt: string | null
  createdAt: string
  updatedAt: string
}

export enum SessionStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  TRANSCRIBING = 'TRANSCRIBING',
  SUMMARIZING = 'SUMMARIZING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * Processing status
 */
export interface ProcessingStatus {
  status: SessionStatus
  progress: number
  currentStep: string
  estimatedTimeRemaining: number | null
}

/**
 * Request types
 */
export interface CreateCampaignRequest {
  name: string
  description?: string | null
  worldPrimer?: string
  settingNotes?: string | null
  playerCharacterMapping?: Record<string, string>
  isPublic?: boolean
}

export interface UpdateCampaignRequest {
  name?: string
  description?: string | null
  worldPrimer?: string
  settingNotes?: string | null
  playerCharacterMapping?: Record<string, string>
  isPublic?: boolean
}

export interface JoinCampaignRequest {
  inviteCode: string
  characterName?: string
}

export interface UpdateMemberRequest {
  role?: CampaignRole
  characterName?: string
}

/**
 * Response types
 */
export interface CampaignListResponse {
  campaigns: Campaign[]
  total: number
  hasMore: boolean
}

export interface CreateCampaignResponse {
  campaign: Campaign
  inviteCode: string | null
}

export interface SessionListResponse {
  sessions: GameSession[]
  total: number
  hasMore: boolean
}

/**
 * Utility types
 */
export type CampaignWithCounts = Campaign & {
  _count: {
    sessions: number
    members: number
  }
}