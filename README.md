# Worldbuilder App - D&D Session Processing Platform

A comprehensive platform for processing D&D session audio recordings into structured narrative summaries using AI. Designed for Dungeon Masters and players who want to preserve their campaign stories without the tedious work of manual note-taking.

## 🎯 Project Purpose

Transform hours of D&D session recordings into polished, structured summaries that capture:
- Session narratives (in-character events only)
- Key story developments and consequences  
- NPCs encountered and locations visited
- Loot, discoveries, and character development
- TL;DR highlights for quick reference

**Target Market**: D&D community as a SaaS platform ($2-5 per session)

## ✨ Key Features

- **Audio Processing**: Upload MP3 recordings up to 4 hours (2GB max)
- **AI-Powered Summarization**: Two-step process (audio → transcript → summary)
- **Campaign Management**: Multi-campaign support with player-character mapping
- **Discord Integration**: OAuth login with Discord accounts
- **Multi-DM Support**: West Marches style campaign compatibility
- **Session History**: Browse and search past session summaries

## 🏗️ Architecture

**Tech Stack:**
- **Frontend/Backend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Discord OAuth
- **AI Processing**: Google Gemini 2.0 Flash API
- **Process Management**: PM2

**Infrastructure:**
- **Development**: Windows PC with VS Code
- **Production**: Raspberry Pi 4 8GB (192.168.86.50:3001)
- **Domain**: worldbuilder.app → Pi routing
- **Deployment**: Git-based manual deployment

## 🚨 Current Known Issues

**UI/Styling Problems (High Priority)**
- Large purple element blocking dashboard view
- Icons displaying incorrectly sized
- Dark theme implementation causing layout conflicts
- Non-responsive design on mobile devices

**Root Cause**: Custom CSS variables conflicting with Tailwind classes

**Workaround**: Focus on functionality; styling refinement in progress

## 🔧 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Discord application for OAuth
- Google AI Studio API key

### Development Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/EzekielTheMad/worldbuilder-app.git
   cd worldbuilder-app
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   **Note**: UI styling issues are known - functionality works despite visual problems.

### Current Functional Features
- ✅ Discord OAuth authentication  
- ✅ Campaign creation and management
- ✅ Database operations
- ❌ Clean UI presentation (in progress)

### Production Deployment (Pi)

1. **Pull latest changes**
   ```bash
   cd /var/www/worldbuilder
   git pull origin main
   ```

2. **Install dependencies and build**
   ```bash
   npm install --production
   npm run build
   ```

3. **Restart application**
   ```bash
   pm2 restart worldbuilder
   ```

## 📊 Audio Processing Details

**Two-Step Processing Approach:**
1. **Audio → Transcript**: Complete session transcription via Gemini
2. **Transcript → Summary**: Structured narrative generation

**Validated Performance:**
- ✅ 4-hour sessions: Complete coverage
- ✅ Cost: ~$0.39 per 4-hour session
- ✅ File size: Up to 309MB MP3 files
- ✅ Uses Gemini Files API for large uploads

**Why Two-Step vs Direct:**
- Direct audio-to-summary only provided partial coverage
- Transcript files enable debugging and reprocessing
- More reliable results for long sessions

## 🗂️ Project Structure

```
worldbuilder-app/
├── docs/                   # Project documentation
├── src/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility functions and configurations
│   └── types/            # TypeScript type definitions
├── prisma/               # Database schema and migrations
├── public/               # Static assets
└── transcripts/          # Generated transcript files (gitignored)
```

## 🔒 Environment Variables

See `.env.example` for complete configuration. Key variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `DISCORD_CLIENT_ID/SECRET`: Discord OAuth credentials
- `GEMINI_API_KEY`: Google AI Studio API key
- `TRANSCRIPT_DIR`: Local transcript storage path

## 📈 Development Roadmap

**Phase 1: Foundation ✅ (Completed)**
- [x] Project setup and documentation
- [x] NextAuth.js Discord integration  
- [x] Database schema with Prisma
- [x] Basic authentication flow
- [x] Campaign creation system

**Phase 2: Core Features 🚧 (In Progress)**
- [x] Campaign management API
- [x] User dashboard interface
- [ ] UI/UX refinement (styling issues)
- [ ] Audio upload component
- [ ] Processing pipeline integration
- [ ] Session results display

**Phase 3: Enhancement 📋 (Planned)**
- [ ] User dashboard and history
- [ ] Advanced summary customization
- [ ] Multi-DM campaign support
- [ ] Performance optimization
- [ ] Production deployment testing

## 🤝 Contributing

This project is currently in active development. For questions or contributions:

1. Check existing documentation in `/docs`
2. Review current issues and roadmap
3. Follow the established code style and patterns
4. Test thoroughly on development environment before PR

## 📝 License

[Add your license choice here]

## 🆘 Support

For technical issues or questions:
- Check the `/docs` directory for detailed guides
- Review environment setup in `SETUP.md`
- Validate requirements in `REQUIREMENTS.md`

---

**Last Updated**: June 2025  
**Status**: Active Development - Foundation Phase