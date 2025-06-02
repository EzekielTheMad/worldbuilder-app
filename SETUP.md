# Development Setup Guide

Complete setup instructions for the Worldbuilder App development and production environments.

## 🖥️ Development Environment Setup (Windows PC)

### Prerequisites Installation

1. **Install Node.js 18+**
   ```bash
   # Download from https://nodejs.org/
   # Verify installation
   node --version  # Should be 18.0.0 or higher
   npm --version
   ```

2. **Install Git**
   ```bash
   # Download from https://git-scm.com/
   # Verify installation
   git --version
   ```

3. **Install VS Code** (Recommended)
   - Download from https://code.visualstudio.com/
   - Install recommended extensions (see below)

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "Prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

### Project Clone and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/EzekielTheMad/worldbuilder-app.git
   cd worldbuilder-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   Edit `.env.local` with your development settings:
   ```env
   # Database (use local PostgreSQL or Docker)
   DATABASE_URL="postgresql://username:password@localhost:5432/worldbuilder_dev"
   
   # NextAuth.js
   NEXTAUTH_SECRET="your-32-character-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Discord OAuth (development app)
   DISCORD_CLIENT_ID="your_dev_discord_client_id"
   DISCORD_CLIENT_SECRET="your_dev_discord_client_secret"
   
   # Google AI
   GEMINI_API_KEY="your_gemini_api_key"
   
   # Development settings
   NODE_ENV="development"
   MAX_FILE_SIZE="500MB"
   TRANSCRIPT_DIR="./transcripts"
   ```

### Database Setup (Development)

**Option A: Local PostgreSQL**
1. Install PostgreSQL 14+
2. Create development database:
   ```sql
   CREATE DATABASE worldbuilder_dev;
   CREATE USER worldbuilder_dev WITH PASSWORD 'dev_password';
   GRANT ALL PRIVILEGES ON DATABASE worldbuilder_dev TO worldbuilder_dev;
   ```

**Option B: Docker PostgreSQL**
```bash
# Run PostgreSQL in Docker
docker run --name worldbuilder-postgres \
  -e POSTGRES_DB=worldbuilder_dev \
  -e POSTGRES_USER=worldbuilder_dev \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  -d postgres:14
```

### Prisma Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### Start Development Server
```bash
npm run dev
```
Visit http://localhost:3000

## 🔑 API Keys and OAuth Setup

### Discord Application Setup

1. **Create Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application"
   - Name: "Worldbuilder App (Dev)"

2. **Configure OAuth2**
   - Go to "OAuth2" → "General"
   - Add redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/discord`
     - Production: `https://worldbuilder.app/api/auth/callback/discord`
   - Copy Client ID and Client Secret

3. **Set Bot Permissions** (if needed)
   - Go to "Bot" section
   - Configure necessary permissions

### Google AI Studio Setup

1. **Get API Key**
   - Go to https://aistudio.google.com/
   - Create new API key
   - Enable Gemini API access

2. **Test API Access**
   ```bash
   # Test with curl
   curl -H "Content-Type: application/json" \
        -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
        -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY"
   ```

## 🥧 Production Setup (Raspberry Pi)

### Pi Hardware Requirements
- Raspberry Pi 4 8GB (minimum)
- 64GB+ SD Card (SSD recommended)
- Stable internet connection
- Power supply with adequate amperage

### Operating System Setup

1. **Install Raspberry Pi OS** (64-bit)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install essential packages
   sudo apt install -y curl git build-essential
   ```

2. **Install Node.js**
   ```bash
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

3. **Install PostgreSQL**
   ```bash
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Start and enable service
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   
   # Create database and user
   sudo -u postgres psql
   ```
   
   In PostgreSQL shell:
   ```sql
   CREATE DATABASE worldbuilder;
   CREATE USER worldbuilder_user WITH PASSWORD 'Jenny0092410';
   ALTER ROLE worldbuilder_user SET client_encoding TO 'utf8';
   ALTER ROLE worldbuilder_user SET default_transaction_isolation TO 'read committed';
   ALTER ROLE worldbuilder_user SET timezone TO 'UTC';
   GRANT ALL PRIVILEGES ON DATABASE worldbuilder TO worldbuilder_user;
   \q
   ```

4. **Install PM2**
   ```bash
   # Install PM2 globally
   sudo npm install -g pm2
   
   # Setup PM2 to start on boot
   pm2 startup
   sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pi --hp /home/pi
   ```

### Application Deployment

1. **Create application directory**
   ```bash
   sudo mkdir -p /var/www/worldbuilder
   sudo chown pi:pi /var/www/worldbuilder
   cd /var/www/worldbuilder
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/EzekielTheMad/worldbuilder-app.git .
   ```

3. **Install dependencies**
   ```bash
   npm ci --production
   ```

4. **Create production environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

5. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Build application**
   ```bash
   npm run build
   ```

7. **Create transcript directory**
   ```bash
   mkdir -p /var/www/worldbuilder/transcripts
   chmod 755 /var/www/worldbuilder/transcripts
   ```

### PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'worldbuilder',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/worldbuilder',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/www/worldbuilder/logs/err.log',
    out_file: '/var/www/worldbuilder/logs/out.log',
    log_file: '/var/www/worldbuilder/logs/combined.log',
    time: true
  }]
}
```

Start the application:
```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
```

### Network Configuration

1. **Firewall Setup**
   ```bash
   # Install ufw if not present
   sudo apt install -y ufw
   
   # Configure firewall
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow ssh
   sudo ufw allow 3001
   sudo ufw enable
   ```

2. **Router Configuration**
   - Port forward 3001 to Pi IP (192.168.86.50)
   - Configure domain routing (worldbuilder.app → Pi)

## 🔄 Development Workflow

### Daily Development
```bash
# Start development server
npm run dev

# In separate terminals:
npx prisma studio  # Database management
npm run lint       # Code linting
npm run type-check # TypeScript checking
```

### Database Changes
```bash
# After schema changes
npx prisma db push       # Push to development DB
npx prisma generate      # Regenerate client

# For production deployment
npx prisma migrate deploy  # Apply migrations
```

### Git Workflow
```bash
# Development workflow
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR on GitHub
# After merge to main:
git checkout main
git pull origin main
```

### Deployment to Production
```bash
# On Pi
cd /var/www/worldbuilder
git pull origin main
npm ci --production
npm run build
pm2 restart worldbuilder
```

## 🐛 Troubleshooting

### Common Development Issues

**Port 3000 already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or use different port
npm run dev -- -p 3001
```

**Database connection issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database
npx prisma db push --force-reset
```

**Node.js version conflicts:**
```bash
# Use Node Version Manager
nvm install 18
nvm use 18
```

### Production Issues

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs worldbuilder

# Check system resources
free -h
df -h
```

**Database connection issues:**
```bash
# Check PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
```

**Permission issues:**
```bash
# Fix file permissions
sudo chown -R pi:pi /var/www/worldbuilder
chmod -R 755 /var/www/worldbuilder
```

### Getting Help

1. Check logs: `pm2 logs` (production) or browser console (development)
2. Verify environment variables are set correctly
3. Ensure all services are running (PostgreSQL, etc.)
4. Check network connectivity and firewall settings
5. Review recent code changes for breaking modifications

---

**Last Updated**: June 2025  
**Maintainer**: Project Team