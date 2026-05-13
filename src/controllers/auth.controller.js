import logger from '#config/logger.js';
import { createUser, loginUser } from '../services/auth.service.js';
import { cookies } from '../utils/cookies.js';
import { formatValidationError } from '../utils/format.js';
import { jwtToken } from '../utils/jwt.js';
import { signinSchema, signupSchema } from '../validations/auth.validation.js';

const createAccessToken = user => {
  return jwtToken.sign({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
};

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed!',
        details: formatValidationError(validationResult.error),
      });
    }
    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });
    const token = createAccessToken(user);

    cookies.set(res, 'access_token', token);
    logger.info(`User registered successfully: ${email}`);
    return res.status(201).json({
      message: 'User registered!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Signup error ', error);
    if (error.message === 'User already exists') {
      return res.status(409).json({
        error: 'Email already exists',
      });
    }
    return next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signinSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed!',
        details: formatValidationError(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;
    const user = await loginUser({ email, password });
    const token = createAccessToken(user);

    cookies.set(res, 'access_token', token);
    logger.info(`User logged in successfully: ${email}`);
    return res.status(200).json({
      message: 'User logged in!',
      user,
    });
  } catch (error) {
    logger.error('Signin error ', error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }
    return next(error);
  }
};

export const signout = (_req, res) => {
  cookies.clear(res, 'access_token');
  logger.info('User logged out successfully');
  return res.status(200).json({
    message: 'User logged out!',
  });
};
