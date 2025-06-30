import bcrypt from 'bcryptjs';
import { db } from '@roboltra/db';
import { users } from '@roboltra/db';
import { eq } from 'drizzle-orm';

export interface User {
  id: string;
  email: string;
  name: string | null;
  platformRole: 'user' | 'admin' | 'super_admin';
  defaultCommunityId: string | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      platformRole: users.platformRole,
      defaultCommunityId: users.defaultCommunityId,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
}

export async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const passwordHash = await hashPassword(data.password);
  
  const [user] = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      name: data.name,
      displayName: data.name,
      platformRole: 'user',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      platformRole: users.platformRole,
      defaultCommunityId: users.defaultCommunityId,
    });
  
  return user;
}

export async function getUserWithPassword(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user;
}