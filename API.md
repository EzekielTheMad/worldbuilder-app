# API Documentation - Worldbuilder App

Complete documentation for the Worldbuilder App API endpoints, data models, and integration patterns.

## 🏗️ API Architecture

### Base URLs
- **Development**: `http://localhost:3000/api`
- **Production**: `https://worldbuilder.app/api`

### Authentication
All API endpoints (except public ones) require authentication via NextAuth.js session cookies or API tokens.

```typescript
// Headers for authenticated requests
{
  "Cookie": "next-auth.session-token=...",
  "Content-Type": "application/json"
}
```

### Response Format
All API responses follow a consistent format:

```typescript
// Success Response
{
  "success": true,
  "data": any,
  "message"?: string
}

// Error Response
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details"?: any
  }
}
```

## 🔐 Authentication Endpoints

### POST /api/auth/session
Get current user session information.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": string,
      "discordId": string,
      "username": string,
      "avatar": string,
      "email": string
    },
    "expires": string
  }
}
```

### POST /api/auth/signin
Redirect to Discord OAuth login.

### POST /api/auth/signout
Sign out current user and clear session.

## 👤 User Management Endpoints

### GET /api/users/me
Get current user profile and associated campaigns.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "id": string,
    "discordId": string,
    "username": string,
    "avatar": string,
    "createdAt": string,
    "lastLogin": string,
    "campaigns": Campaign[]
  }
}
```

### PUT /api/users/me
Update current user profile.

**Request Body:**
```typescript
{
  "username"?: string,
  "settings"?: {
    "emailNotifications": boolean,
    "discordNotifications": boolean
  }
}
```

### DELETE /api/users/me
Delete current user account and all associated data.

**Response:**
```typescript
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## 🏰 Campaign Management Endpoints

### GET /api/campaigns
Get all campaigns for the current user.

**Query Parameters:**
- `role`: Filter by user role (`owner`, `dm`, `player`)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

**Response:**
```typescript
{
  "success": true,
  "data": {
    "campaigns": Campaign[],
    "total": number,
    "hasMore": boolean
  }
}
```

### POST /api/campaigns
Create a new campaign.

**Request Body:**
```typescript
{
  "name": string,
  "description"?: string,
  "worldPrimer": string,
  "settingNotes"?: string,
  "playerCharacterMapping": {
    [playerName: string]: string  // character name
  },
  "isPublic": boolean
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "campaign": Campaign,
    "inviteCode": string
  }
}
```

### GET /api/campaigns/[id]
Get specific campaign details.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "campaign": Campaign,
    "members": CampaignMember[],
    "recentSessions": Session[],
    "permissions": {
      "canEdit": boolean,
      "canUpload": boolean,
      "canInvite": boolean,
      "canDelete": boolean
    }
  }
}
```

### PUT /api/campaigns/[id]
Update campaign settings.

**Request Body:**
```typescript
{
  "name"?: string,
  "description"?: string,
  "worldPrimer"?: string,
  "settingNotes"?: string,
  "playerCharacterMapping"?: {
    [playerName: string]: string
  },
  "isPublic"?: boolean
}
```

### DELETE /api/campaigns/[id]
Delete campaign and all associated sessions.

### POST /api/campaigns/[id]/members
Add member to campaign (via invite code or direct invite).

**Request Body:**
```typescript
{
  "inviteCode"?: string,      // For joining via invite code
  "discordId"?: string,       // For direct invite (owner/DM only)
  "characterName"?: string,
  "role": "dm" | "player"
}
```

### DELETE /api/campaigns/[id]/members/[userId]
Remove member from campaign.

### PUT /api/campaigns/[id]/members/[userId]
Update member role or character information.

**Request Body:**
```typescript
{
  "role"?: "dm" | "player",
  "characterName"?: string
}
```

## 🎵 Audio Processing Endpoints

### POST /api/sessions/upload
Upload and process an audio file.

**Request:** Multipart form data
```typescript
{
  "audioFile": File,           // MP3 file up to 2GB
  "campaignId": string,
  "sessionTitle"?: string,
  "sessionNotes"?: string
}
```

**Response:**
```typescript
{
  "success": true,
  "data": {
    "sessionId": string,
    "status": "queued" | "processing" | "completed" | "failed",
    "estimatedCompletionTime": string
  }
}
```

### GET /api/sessions/[id]/status
Get processing status for a session.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "sessionId": string,
    "status": "queued" | "processing" | "completed" | "failed",
    "progress": {
      "stage": "upload" | "transcription" | "summarization" | "complete",
      "percentage": number,
      "estimatedTimeRemaining": number  // seconds
    },
    "error"?: string
  }
}
```

### GET /api/sessions/[id]/transcript
Download the raw transcript file.

**Response:** Plain text file or JSON with timestamps

### POST /api/sessions/[id]/reprocess
Reprocess a session with different parameters.

**Request Body:**
```typescript
{
  "summaryStyle"?: "detailed" | "concise" | "narrative",
  "focusAreas"?: string[],      // ["combat", "roleplay", "story"]
  "customPrompt"?: string
}
```

## 📝 Session Management Endpoints

### GET /api/sessions
Get sessions for campaigns the user has access to.

**Query Parameters:**
- `campaignId`: Filter by specific campaign
- `status`: Filter by processing status
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset
- `sortBy`: `createdAt` | `processedAt` | `title`
- `sortOrder`: `asc` | `desc`

**Response:**
```typescript
{
  "success": true,
  "data": {
    "sessions": Session[],
    "total": number,
    "hasMore": boolean
  }
}
```

### GET /api/sessions/[id]
Get complete session details including summary.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "session": Session,
    "summary": {
      "tldr": string[],
      "sessionRecap": string,
      "keyEvents": string[],
      "npcsEncountered": NpcEncounter[],
      "locationsVisited": LocationVisit[],
      "lootAndDiscoveries": LootItem[],
      "downtimeActivities": string[]
    },
    "campaign": {
      "id": string,
      "name": string,
      "playerCharacterMapping": object
    }
  }
}
```

### PUT /api/sessions/[id]
Update session metadata or summary.

**Request Body:**
```typescript
{
  "title"?: string,
  "notes"?: string,
  "customSummary"?: {
    "tldr"?: string[],
    "sessionRecap"?: string,
    "keyEvents"?: string[],
    // ... other summary fields
  }
}
```

### DELETE /api/sessions/[id]
Delete session and associated files.

## 🔧 System Endpoints

### GET /api/health
System health check endpoint.

**Response:**
```typescript
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": string,
    "services": {
      "database": "connected" | "disconnected",
      "geminiApi": "available" | "unavailable",
      "diskSpace": {
        "available": number,    // bytes
        "total": number,
        "percentage": number
      }
    }
  }
}
```

### GET /api/system/stats
System statistics (admin only).

**Response:**
```typescript
{
  "success": true,
  "data": {
    "users": {
      "total": number,
      "active": number,      // last 30 days
      "newThisMonth": number
    },
    "campaigns": {
      "total": number,
      "active": number
    },
    "sessions": {
      "total": number,
      "processedThisMonth": number,
      "averageProcessingTime": number,  // seconds
      "totalAudioHours": number
    },
    "costs": {
      "geminiApiCosts": number,
      "averageCostPerSession": number
    }
  }
}
```

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  settings: {
    emailNotifications: boolean;
    discordNotifications: boolean;
  };
}
```

### Campaign
```typescript
interface Campaign {
  id: string;
  name: string;
  description?: string;
  worldPrimer: string;
  settingNotes?: string;
  playerCharacterMapping: {
    [playerName: string]: string;  // character name
  };
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  inviteCode: string;
  memberCount: number;
  sessionCount: number;
  lastSessionAt?: string;
}
```

### CampaignMember
```typescript
interface CampaignMember {
  id: string;
  campaignId: string;
  userId: string;
  characterName?: string;
  role: "owner" | "dm" | "player";
  joinedAt: string;
  user: {
    username: string;
    avatar: string;
  };
}
```

### Session
```typescript
interface Session {
  id: string;
  campaignId: string;
  uploadedBy: string;
  title?: string;
  notes?: string;
  audioFilename: string;
  audioFileSize: number;
  audioFileDuration?: number;  // seconds
  transcriptPath?: string;
  status: "queued" | "processing" | "completed" | "failed";
  processingStartedAt?: string;
  processedAt?: string;
  createdAt: string;
  errorMessage?: string;
  summaryJson?: SessionSummary;
  processingMetadata: {
    transcriptionTime?: number;
    summarizationTime?: number;
    totalTokensUsed?: number;
    estimatedCost?: number;
  };
}
```

### SessionSummary
```typescript
interface SessionSummary {
  tldr: string[];
  sessionRecap: string;
  keyEvents: string[];
  npcsEncountered: NpcEncounter[];
  locationsVisited: LocationVisit[];
  lootAndDiscoveries: LootItem[];
  downtimeActivities: string[];
  metadata: {
    sessionDuration: number;     // minutes
    mainStoryBeats: string[];
    characterMoments: {
      [characterName: string]: string[];
    };
  };
}
```

### Supporting Types
```typescript
interface NpcEncounter {
  name: string;
  description: string;
  role: string;               // "ally", "enemy", "neutral", "merchant", etc.
  significance: "minor" | "major" | "critical";
}

interface LocationVisit {
  name: string;
  description: string;
  atmosphere: string;
  significance: "minor" | "major" | "critical";
}

interface LootItem {
  name: string;
  description: string;
  type: "weapon" | "armor" | "treasure" | "magical" | "consumable" | "other";
  recipient?: string;         // character name
  value?: string;
}
```

## 🔌 Webhook Endpoints

### POST /api/webhooks/discord
Handle Discord webhook events (optional feature).

### POST /api/webhooks/processing-complete
Internal webhook for processing completion notifications.

## ⚠️ Error Codes

### Authentication Errors
- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid or expired session
- `AUTH_FORBIDDEN`: Insufficient permissions

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `FILE_TOO_LARGE`: File exceeds size limit
- `UNSUPPORTED_FORMAT`: Unsupported file format

### Processing Errors
- `UPLOAD_FAILED`: File upload failed
- `TRANSCRIPTION_FAILED`: Audio transcription failed
- `SUMMARIZATION_FAILED`: Summary generation failed
- `API_QUOTA_EXCEEDED`: AI API quota exceeded

### System Errors
- `INTERNAL_ERROR`: Internal server error
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_API_ERROR`: External service unavailable

## 🚀 Rate Limiting

### Default Limits
- **General API**: 60 requests per minute per IP
- **File Upload**: 5 uploads per hour per user
- **Processing**: 3 concurrent sessions per user

### Headers
```typescript
{
  "X-RateLimit-Limit": "60",
  "X-RateLimit-Remaining": "45",
  "X-RateLimit-Reset": "1640995200"
}
```

## 🧪 Testing

### Development API Base
```bash
# Start development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

### Example API Calls
```javascript
// Get user campaigns
const response = await fetch('/api/campaigns', {
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include'
});

// Upload session
const formData = new FormData();
formData.append('audioFile', file);
formData.append('campaignId', campaignId);

const response = await fetch('/api/sessions/upload', {
  method: 'POST',
  body: formData,
  credentials: 'include'
});
```

---

**API Version**: 1.0  
**Last Updated**: June 2025  
**OpenAPI Spec**: Available at `/api/docs` (when implemented)