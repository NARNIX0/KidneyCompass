import bcrypt from 'bcrypt';
import prisma from '../db';

const SALT_ROUNDS = 10;

export interface UserInput {
  email: string;
  password: string;
}

export interface UserOutput {
  id: number;
  email: string;
  createdAt: Date;
}

export async function createUser(userData: UserInput): Promise<UserOutput> {
  // Check if user with email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash,
    },
  });

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function authenticateUser(email: string, password: string): Promise<UserOutput | null> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // Check if password matches
  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function getUserById(id: number): Promise<UserOutput | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
} 