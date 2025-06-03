/**
 * Prisma Database Client Configuration
 * 
 * This file sets up the Prisma client with proper connection handling
 * and prevents multiple instances in development due to hot reloading.
 */

import { PrismaClient } from '@prisma/client'

/**
 * Global variable to store Prisma client in development
 * This prevents creating multiple Prisma instances due to hot reloading
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create Prisma client with optimized configuration
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Log database queries in development for debugging
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  
  // Database connection configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Store client in global variable in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler for Prisma client
 * Ensures database connections are properly closed
 */
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

/**
 * Database health check utility
 * Use this to verify database connectivity
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}