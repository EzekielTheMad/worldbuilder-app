# Project Requirements - Worldbuilder App

## 🎯 Business Requirements

### Core Value Proposition
Transform D&D session audio recordings into structured, narrative summaries that preserve campaign stories without manual note-taking effort.

### Target Users
- **Primary**: Dungeon Masters managing ongoing campaigns
- **Secondary**: D&D players wanting session records
- **Market**: Broader D&D community via SaaS model

### Revenue Model
- **Pricing**: $2-5 per processed session
- **Cost Structure**: ~$0.39 per 4-hour session (Gemini API)
- **Target Margin**: 80%+ gross margin

## 🔧 Technical Requirements

### System Architecture
- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Discord OAuth
- **AI Processing**: Google Gemini 2.0 Flash API
- **Deployment**: Raspberry Pi 4 8GB production server

### Performance Requirements
- **File Processing**: Support up to 2GB MP3 files (4+ hour sessions)
- **Processing Time**: Complete processing within reasonable time (10-30 minutes for 4-hour sessions)
- **Availability**: 99%+ uptime for production service
- **Concurrent Users**: Support multiple simultaneous uploads

### Infrastructure Constraints
- **Network**: ISP blocks port 80 (using port 3001)
- **Storage**: Local file system on Pi for transcripts
- **Domain**: worldbuilder.app routing to Pi server
- **Process Management**: PM2 for application lifecycle

## 📊 Audio Processing Requirements

### Input Specifications
- **Format**: MP3 audio files
- **Size Limit**: 2GB maximum file size
- **Duration**: Support sessions up to 4+ hours
- **Quality**: No specific quality requirements (system handles various bitrates)

### Processing Pipeline
1. **Upload Validation**: Verify file format, size, and integrity
2. **Audio → Transcript**: Complete session transcription via Gemini Files API
3. **Transcript → Summary**: Structured narrative generation
4. **Storage**: Save transcripts locally for debugging/reprocessing

### Output Requirements
- **Complete Coverage**: Must process entire session (not partial)
- **Structured Format**: Specific summary sections (detailed below)
- **Debuggable**: Intermediate files (transcripts) must be saved
- **Reliable**: Consistent results for similar input

## 📝 Summary Format Requirements

### Required Sections
1. **TL;DR**: 2-4 bullet points of critical session outcomes
2. **Session Recap**: Full chronological narrative (in-character events only)
3. **Key Events**: Pivotal scenes and their consequences
4. **NPCs Encountered**: Brief descriptors for new/recurring characters
5. **Locations Visited**: Atmospheric descriptions and story relevance
6. **Loot & Discoveries**: Treasure, magical items, and important findings
7. **Downtime Activities**: Character development and personal moments

### Content Guidelines
- **Focus**: In-character events only (no out-of-character chatter)
- **Perspective**: Third-person narrative from party perspective
- **Tone**: Match campaign setting (gritty, heroic, comedic, etc.)
- **Length**: Comprehensive but readable (1-3 pages typical)

## 👥 User Management Requirements

### Authentication
- **Primary Method**: Discord OAuth integration
- **User Data**: Discord username, avatar, and ID
- **Session Management**: Persistent login with NextAuth.js
- **Security**: Secure token handling and CSRF protection

### User Roles & Permissions
- **Campaign Owner**: Full campaign management and member invitation
- **DM**: Session upload and processing permissions
- **Player**: Read access to campaign sessions
- **Multi-DM Support**: Multiple DMs per campaign (West Marches style)

### Data Privacy
- **User Data**: Minimal collection (Discord profile only)
- **Audio Files**: Temporary storage during processing
- **Transcripts**: Secure local storage with access controls
- **GDPR Compliance**: User data deletion capabilities

## 🗃️ Database Requirements

### Core Entities
```sql
-- User management
users (discord_id, username, avatar_url, created_at, last_login)

-- Campaign management  
campaigns (id, name, world_primer, setting_notes, owner_id, created_at)
campaign_members (campaign_id, user_id, character_name, role, joined_at)

-- Session processing
sessions (id, campaign_id, uploaded_by, audio_filename, transcript_path, 
         summary_json, processing_status, created_at, processed_at)

-- Player-character mapping
character_mappings (campaign_id, player_name, character_name, voice_notes)
```

### Data Integrity
- **Foreign Key Constraints**: Maintain referential integrity
- **Cascade Deletes**: Proper cleanup when campaigns/users are deleted
- **Indexing**: Optimize queries for campaign and session lookups
- **Backup Strategy**: Regular PostgreSQL backups

## 🔌 Integration Requirements

### Discord Integration
- **OAuth Setup**: Discord application with proper redirect URIs
- **Permissions**: Read user profile and guilds (for campaign invites)
- **Error Handling**: Graceful fallback for Discord API issues

### Google AI Integration
- **API Access**: Gemini 2.0 Flash with Files API capability
- **Rate Limiting**: Handle API quotas and throttling
- **Error Recovery**: Retry logic for transient failures
- **Cost Monitoring**: Track API usage and costs

### File System Integration
- **Local Storage**: Organized transcript file structure
- **Path Management**: Consistent file naming and organization
- **Cleanup**: Automated old file removal policies
- **Permissions**: Proper file system access controls

## 🎨 User Interface Requirements

### Design Principles
- **Simplicity**: Clean, intuitive interface for non-technical users
- **Responsiveness**: Works on desktop and mobile devices
- **Accessibility**: WCAG compliance for screen readers
- **Performance**: Fast loading and smooth interactions

### Key User Flows
1. **New User**: Discord login → Create/join campaign → Upload session
2. **Returning User**: Login → Select campaign → View/upload sessions
3. **Session Processing**: Upload → Monitor progress → View results
4. **Campaign Management**: Create campaign → Add members → Manage settings

### Component Requirements
- **File Upload**: Drag-and-drop with progress indicators
- **Processing Status**: Real-time updates on processing progress
- **Summary Display**: Formatted, readable session summaries
- **Campaign Dashboard**: Overview of all campaigns and recent sessions

## 📱 Platform Requirements

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **JavaScript**: ES2020+ features required
- **File API**: HTML5 file upload capabilities

### Development Environment
- **OS**: Windows PC for development
- **IDE**: VS Code with recommended extensions
- **Node.js**: Version 18+ required
- **Package Manager**: npm (not yarn or pnpm)

### Production Environment
- **Hardware**: Raspberry Pi 4 8GB minimum
- **OS**: Linux (Raspberry Pi OS or Ubuntu)
- **Network**: Stable internet with sufficient upload bandwidth
- **Storage**: SSD recommended for database and file operations

## 🔒 Security Requirements

### Data Protection
- **Encryption**: HTTPS/TLS for all communications
- **Authentication**: Secure token-based authentication
- **File Security**: Proper access controls on uploaded files
- **Database Security**: Parameterized queries, no SQL injection

### Privacy Considerations
- **Minimal Data**: Collect only necessary user information
- **Consent**: Clear terms for audio processing and storage
- **Data Retention**: Policies for transcript and audio file cleanup
- **User Control**: Ability to delete personal data

## 🧪 Testing Requirements

### Functional Testing
- **Audio Processing**: Test with various file sizes and formats
- **User Flows**: Complete end-to-end testing of all user journeys
- **Integration**: Discord OAuth and Gemini API integration testing
- **Error Handling**: Graceful degradation for all failure modes

### Performance Testing
- **Load Testing**: Multiple concurrent file uploads
- **Large Files**: 2GB file processing validation
- **Database**: Query performance under load
- **Memory Usage**: Monitor for memory leaks during processing

### Deployment Testing
- **Development**: Local environment validation
- **Production**: Pi deployment and performance validation
- **Backup/Recovery**: Data backup and restoration procedures

---

**Document Version**: 1.0  
**Last Updated**: June 2025  
**Review Schedule**: Monthly during active development