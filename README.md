# World Builder - D&D Session Management Platform

A SaaS platform for automatically transcribing and summarizing D&D sessions using AI.

## Features
- 🎙️ Audio session recording and transcription
- 🤖 AI-powered session summaries in your campaign's style
- 📊 Character development tracking
- 💬 Discord integration for automatic summary posting
- 🏰 Multi-DM support for West Marches campaigns

## Tech Stack
- **Backend**: Python/Flask + PostgreSQL
- **Queue**: Redis + RQ for async audio processing  
- **AI**: Google Gemini 2.0 Flash
- **Infrastructure**: Docker on unRAID
- **Frontend**: Static HTML (Next.js coming soon)

## Development Setup
1. Copy `.env.example` to `.env` and fill in your values
2. Run `docker-compose up -d`
3. Access API at http://localhost:5001

## Project Status
- ✅ Docker infrastructure complete
- ✅ Basic API structure
- 🚧 Discord OAuth implementation
- 📋 Audio processing pipeline
- 📋 Frontend application