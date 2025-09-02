import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    cognitoId: string;
    email: string;
    role: string;
  };
}

export const createContext = async (event: any): Promise<Context> => {
  const context: Context = { prisma };
  
  // Local development bypass: when enabled, always attach a dev user to the context
  // Useful when testing without Cognito sign-in. Do NOT enable in production.
  if (process.env['LOCAL_DEV_BYPASS'] === 'true') {
    try {
      const devCognitoId = 'dev-user';
      let user = await prisma.user.findUnique({ where: { cognito_id: devCognitoId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            cognito_id: devCognitoId,
            email: 'dev@example.com',
            first_name: 'Dev',
            last_name: 'User',
            role: 'ADMIN',
            updated_at: new Date(),
          },
        });
      }
      context.user = {
        id: user.id,
        cognitoId: user.cognito_id,
        email: user.email,
        role: user.role,
      };
      return context;
    } catch (e) {
      console.error('⚠️ LOCAL_DEV_BYPASS failed to attach user:', e);
    }
  }
  
  // Extract authorization header
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      // Decode JWT token (in production, verify against Cognito's public keys)
      const decoded = jwt.decode(token) as any;
      
      if (decoded && decoded.sub) {
        // Extract email from various possible locations in Cognito token
        const email = decoded.email || 
                     decoded['cognito:username'] || 
                     decoded.username ||
                     `user-${decoded.sub}@placeholder.com`;
        
        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
          console.log('❌ Token expired');
          return context;
        }
        
        // Find or create user in database
        let user = await prisma.user.findUnique({
          where: { cognito_id: decoded.sub },
        });
        
        if (!user) {
          // Create new user from Cognito token
          user = await prisma.user.create({
            data: {
              cognito_id: decoded.sub,
              email: email,
              first_name: decoded.given_name || decoded['cognito:given_name'] || '',
              last_name: decoded.family_name || decoded['cognito:family_name'] || '',
              role: 'PUBLIC',
              updated_at: new Date(),
            },
          });
        }
        
        context.user = {
          id: user.id,
          cognitoId: user.cognito_id,
          email: user.email,
          role: user.role,
        };
      }
    } catch (error) {
      console.error('❌ JWT processing failed:', error);
    }
  }
  
  return context;
};

// Helper functions for authorization
export function requireAuth(context: Context) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
}

export function requireAdmin(context: Context) {
  requireAuth(context);
  if (context.user!.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}