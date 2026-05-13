import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { users } from '../models/user.model';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';

export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.info(`Error hashing password: ${error}`);
    throw new Error('Error hashing');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser) throw new Error('User already exists!');

    const hash_password = await await hashPassword(password);

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
        create_at: users.created_at
      });
    logger.info(`User ${newUser.email} created successfully!`);

    return newUser;
  } catch (error) {
    logger.info(`Error in creating user: ${error}`);
    throw new Error(error);
  }
};
