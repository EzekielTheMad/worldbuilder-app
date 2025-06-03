/**
 * NextAuth.js Configuration
 * 
 * This file configures NextAuth.js for the Worldbuilder App with Discord OAuth.
 * Handles user authentication, session management, and database integration.
 */

import { NextAuthOptions } from "next-auth"
import DiscordProvider from "next-auth/providers/discord"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

// Extend the built-in session types to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      discordId: string
      username: string
      email: string
      image: string
    }
  }

  interface User {
    discordId: string
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    discordId: string
    username: string
  }
}

/**
 * NextAuth.js configuration object
 * 
 * This configuration:
 * - Uses Discord as the OAuth provider
 * - Stores user data in PostgreSQL via Prisma
 * - Customizes session and JWT callbacks for our user model
 * - Handles user creation and updates
 */
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database integration
  adapter: PrismaAdapter(prisma),

  // Configure OAuth providers
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      
      // Request specific Discord scopes
      authorization: {
        params: {
          scope: "identify email guilds", // guilds scope for future campaign invites
        },
      },
      
      // Map Discord profile to our user model
      profile(profile) {
        return {
          id: profile.id,
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          image: profile.avatar 
            ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${profile.discriminator % 5}.png`,
        }
      },
    }),
  ],

  // Database session strategy (required for Prisma adapter)
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Customize pages (optional - use default for now)
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },

  // Callback functions to customize behavior
  callbacks: {
    /**
     * Session callback - runs whenever a session is checked
     * Adds our custom fields to the session object
     */
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id
        session.user.discordId = user.discordId
        session.user.username = user.username
      }
      return session
    },

    /**
     * JWT callback - runs whenever a JWT is created/updated
     * Note: Only used if session strategy is "jwt" instead of "database"
     */
    async jwt({ token, user, account }) {
      if (user) {
        token.discordId = user.discordId
        token.username = user.username
      }
      return token
    },

    /**
     * SignIn callback - runs on successful sign in
     * Can be used to control who can sign in or perform post-signin actions
     */
    async signIn({ user, account, profile }) {
      // Allow all Discord users to sign in
      // Add custom logic here if you want to restrict access
      return true
    },
  },

  // Event handlers for logging and analytics
  events: {
    /**
     * Track user sign ins for analytics/security
     */
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`User signed in: ${user.username} (${user.id})`, {
        isNewUser,
        provider: account?.provider,
      })
      
      // Update last login timestamp
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        }).catch(console.error)
      }
    },

    /**
     * Track user creation for analytics
     */
    async createUser({ user }) {
      console.log(`New user created: ${user.username} (${user.id})`)
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === "development",

  // Secret for JWT signing and encryption
  secret: process.env.NEXTAUTH_SECRET,
}

/**
 * Type-safe helper function to get server-side session
 * Use this in API routes and server components
 */
export async function getServerSession() {
  const { getServerSession } = await import("next-auth/next")
  return getServerSession(authOptions)
}

/**
 * Utility function to get current user from session
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession()
  return session?.user || null
}

/**
 * Utility function to require authentication
 * Throws an error if user is not authenticated - use in API routes
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}