/**
 * Script to set admin role for a Clerk user
 *
 * Usage:
 *   npx tsx scripts/set-admin-role.ts <USER_ID>
 *
 * Example:
 *   npx tsx scripts/set-admin-role.ts user_2abc123def456
 *
 * You can find your user ID by running:
 *   npx tsx scripts/list-users.ts
 */

import { createClerkClient } from '@clerk/backend';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('Error: CLERK_SECRET_KEY environment variable is not set');
  console.error('Make sure you have a .env.local file with CLERK_SECRET_KEY');
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function setAdminRole(userId: string) {
  if (!userId) {
    console.error('Usage: npx tsx scripts/set-admin-role.ts <USER_ID>');
    console.error('');
    console.error('To find your user ID, run:');
    console.error('  npx tsx scripts/list-users.ts');
    process.exit(1);
  }

  try {
    console.log(`Setting admin role for user: ${userId}`);

    // First, get the current user to verify they exist
    await clerkClient.users.getUser(userId);

    // Update the user with admin role
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: 'admin' },
    });

    console.log('');
    console.log('='.repeat(50));
    console.log('SUCCESS! Admin role has been set.');
    console.log('='.repeat(50));
    console.log('');
    console.log('User details:');
    console.log(`  ID:    ${user.id}`);
    console.log(`  Email: ${user.emailAddresses[0]?.emailAddress || 'N/A'}`);
    console.log(`  Name:  ${user.firstName || ''} ${user.lastName || ''}`);
    console.log(`  Role:  ${(user.publicMetadata as { role?: string }).role}`);
    console.log('');
    console.log('You can now:');
    console.log('  1. Sign in at /sign-in');
    console.log('  2. Access the admin panel at /admin');
    console.log('');
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        console.error(`Error: User with ID "${userId}" not found.`);
        console.error('');
        console.error('Run this command to list all users:');
        console.error('  npx tsx scripts/list-users.ts');
      } else {
        console.error('Error setting admin role:', error.message);
      }
    } else {
      console.error('Error setting admin role:', error);
    }
    process.exit(1);
  }
}

const userId = process.argv[2];
setAdminRole(userId);
