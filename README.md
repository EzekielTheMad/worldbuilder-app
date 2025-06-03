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
- **Dark Fantasy Theme**: Custom D&D-themed UI with magical effects
- **Multi-DM Support**: West Marches style campaign compatibility
- **Session History**: Browse and search past session summaries

## 🏗️ Architecture

### Tech Stack
- **Frontend/Backend**: Next.js 15.3.3 with TypeScript
- **Styling**: Tailwind CSS v4 + Custom Design System
- **Database**: PostgreSQL with Prisma ORM (v6.8.2)
- **Authentication**: NextAuth.js with Discord OAuth
- **AI Processing**: Google Gemini 2.0 Flash API
- **State Management**: React 19 with Server Components
- **Process Management**: PM2 (production)

### Design System
- **Theme**: Dark fantasy with purple magic colors
- **Typography**: Cinzel (headers), Inter (body), Fira Code (mono)
- **Components**: Custom UI library with magical animations
- **CSS Architecture**: CSS Modules + Tailwind v4 hybrid

### Infrastructure
- **Development**: Windows PC with VS Code
- **Production**: Raspberry Pi 4 8GB (192.168.86.50:3001)
- **Domain**: worldbuilder.app → Pi routing
- **Deployment**: Git-based manual deployment

## 🚀 Quick Start

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
   # Open http://localhost:3000
   ```

### Production Deployment (Pi)

1. **SSH into Pi and navigate to project**
   ```bash
   ssh user@192.168.86.50
   cd /var/www/worldbuilder
   ```

2. **Pull latest changes**
   ```bash
   git pull origin main
   ```

3. **Install dependencies and build**
   ```bash
   npm ci --production
   npm run build
   ```

4. **Restart application**
   ```bash
   pm2 restart worldbuilder
   ```

## 📊 Audio Processing Details

### Two-Step Processing Approach
1. **Audio → Transcript**: Complete session transcription via Gemini
2. **Transcript → Summary**: Structured narrative generation

### Validated Performance
- ✅ 4-hour sessions: Complete coverage
- ✅ Cost: ~$0.39 per 4-hour session
- ✅ File size: Up to 309MB MP3 files
- ✅ Uses Gemini Files API for large uploads

### Why Two-Step vs Direct
- Direct audio-to-summary only provided partial coverage
- Transcript files enable debugging and reprocessing
- More reliable results for long sessions

## 🗂️ Project Structure

```
worldbuilder-app/
├── docs/                   # Project documentation
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── (auth)/       # Auth-required routes
│   │   ├── api/          # API routes
│   │   └── layout.tsx    # Root layout with fonts
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── auth/         # Authentication components
│   ├── lib/              # Utility functions
│   │   ├── auth.ts       # NextAuth configuration
│   │   ├── prisma.ts     # Database client
│   │   └── utils.ts      # Helper functions
│   ├── styles/           # CSS architecture
│   │   ├── globals.css   # Main styles + Tailwind
│   │   ├── design-system/# Tokens, typography, etc.
│   │   └── themes/       # Dark fantasy theme
│   └── types/            # TypeScript definitions
├── prisma/               # Database schema
├── public/               # Static assets
└── transcripts/          # Generated transcripts (gitignored)
```

## 🎨 UI Component Library

### Core Components
- **Button**: 5 variants with magic shimmer effect
- **Card**: Session and campaign display cards
- **Input/Form**: Styled form elements
- **Badge**: Status indicators (active, paused, completed)
- **Alert**: User feedback messages
- **Skeleton**: Loading states with shimmer

### Special Effects
- `glow-pulse`: Magical glow animation
- `sparkle`: Twinkling effect for magic items
- `dice-roll`: D20 rotation animation
- `gradient-border`: Animated border effect

## 🔐 Environment Variables

Required variables (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/worldbuilder"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"

# Google AI
GEMINI_API_KEY="your-gemini-api-key"

# File Storage
TRANSCRIPT_DIR="./transcripts"
UPLOAD_DIR="./uploads"
```

## 📈 Development Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project setup and documentation
- [x] NextAuth.js Discord integration  
- [x] Database schema with Prisma
- [x] CSS architecture with Tailwind v4
- [x] Component library foundation
- [x] Basic authentication flow
- [x] Campaign CRUD operations

### 🚧 Phase 2: Core Features (In Progress)
- [x] Campaign management API
- [x] User dashboard interface
- [x] Dark fantasy theme implementation
- [ ] Audio upload component
- [ ] Processing pipeline integration
- [ ] Session results display
- [ ] Real-time processing status

### 📋 Phase 3: Enhancement (Planned)
- [ ] Advanced summary customization
- [ ] Multi-DM campaign support
- [ ] Session search and filtering
- [ ] Export options (PDF, Discord webhook)
- [ ] Performance optimization
- [ ] Subscription system (Stripe)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Contributing

This project is currently in active development. For questions or contributions:

1. Check existing documentation in `/docs`
2. Review current issues and roadmap
3. Follow the established code style and patterns
4. Use the existing component library
5. Test thoroughly before submitting PRs

### Code Style
- Use TypeScript for all new code
- Follow the existing component patterns
- Use the design system tokens for styling
- Comment complex logic thoroughly
- Keep components small and focused

## 📝 Recent Updates

**June 2025 - Tailwind v4 Migration**
- Migrated from Tailwind v3 to v4
- Removed all `@apply` directives for compatibility
- Updated CSS architecture for better maintainability
- Fixed PostCSS configuration issues
- Converted design system to use direct CSS

## 🐛 Known Issues

- Some component hover states need refinement
- Mobile responsive design needs testing
- Animation performance on older devices
- Font loading flash on first load

## 📚 Documentation

Detailed documentation available in `/docs`:
- `SETUP.md` - Complete setup instructions
- `REQUIREMENTS.md` - Technical requirements
- `API.md` - API endpoint documentation
- `CSS_ARCHITECTURE.md` - Styling guide
- `COMPONENT_LIBRARY.md` - UI component docs

## 🆘 Support

For technical issues or questions:
- Check the `/docs` directory for detailed guides
- Review common issues in GitHub Issues
- Ensure all environment variables are set correctly
- Check the console for error messages

---

**Version**: 0.1.0  
**Last Updated**: June 2025  
**Status**: Active Development - Core Features Phase  
**License**: [To be determined]