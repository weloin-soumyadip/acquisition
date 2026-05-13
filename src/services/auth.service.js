import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { users } from '../models/user.model.js';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';

const normalizeAuthUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw new Error('Error hashing');
  }
};
const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error(`Error comparing password: ${error}`);
    throw new Error('Error comparing password');
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) throw new Error('Invalid email or password');

    const isPasswordValid = await comparePassword(password, existingUser.password);
    if (!isPasswordValid) throw new Error('Invalid email or password');

    return normalizeAuthUser(existingUser);
  } catch (error) {
    logger.error(`Error in login user: ${error}`);
    throw error;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) throw new Error('User already exists');

    const hash_password = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hash_password,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    logger.info(`User ${newUser.email} created successfully!`);

    return newUser;
  } catch (error) {
    logger.error(`Error in creating user: ${error}`);
    throw error;
  }
};
