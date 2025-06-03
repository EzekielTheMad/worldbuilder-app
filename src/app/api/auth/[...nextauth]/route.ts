/**
 * NextAuth.js API Route Handler
 * 
 * This file creates the dynamic API route that handles all NextAuth.js endpoints:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out functionality  
 * - /api/auth/callback/discord - OAuth callback
 * - /api/auth/session - Get current session
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - Available providers
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * NextAuth handler that handles all authentication requests
 * Uses the configuration from @/lib/auth
 */
const handler = NextAuth(authOptions)

// Export handler for both GET and POST requests
// Next.js 13+ App Router requires named exports
export { handler as GET, handler as POST }