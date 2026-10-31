import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { User, UserRole } from '../../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = dbStore.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      throw new AppError('email, password, and fullName are required', 400);
    }

    const existing = dbStore.getUserByEmail(email);
    if (existing) {
      throw new AppError(`User with email '${email}' already exists`, 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `usr-${uuidv4().substring(0, 8)}`,
      email,
      passwordHash,
      fullName,
      role: (role as UserRole) || 'DISASTER_MANAGER',
      createdAt: new Date().toISOString(),
    };

    dbStore.saveUser(newUser);

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = dbStore.getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}
