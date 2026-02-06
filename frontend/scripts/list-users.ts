/**
 * Script to list all Clerk users
 *
 * Usage:
 *   npx tsx scripts/list-users.ts
 *
 * This will show all users with their IDs and roles.
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

async function listUsers() {
  try {
    console.log('Fetching users from Clerk...\n');

    const users = await clerkClient.users.getUserList({
      limit: 100,
      orderBy: '-created_at',
    });

    if (users.data.length === 0) {
      console.log('No users found.');
      console.log('\nTo create a user, sign up at your app\'s /sign-up page.');
      return;
    }

    console.log('='.repeat(80));
    console.log('USERS LIST');
    console.log('='.repeat(80));
    console.log('');

    users.data.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'No email';
      const role = (user.publicMetadata as { role?: string })?.role || 'user';
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No name';

      console.log(`${index + 1}. ${name}`);
      console.log(`   ID:    ${user.id}`);
      console.log(`   Email: ${email}`);
      console.log(`   Role:  ${role}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`Total: ${users.data.length} user(s)`);
    console.log('');
    console.log('To set a user as admin, run:');
    console.log('  npx tsx scripts/set-admin-role.ts <USER_ID>');
    console.log('');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching users:', error.message);
    } else {
      console.error('Error fetching users:', error);
    }
    process.exit(1);
  }
}

listUsers();
