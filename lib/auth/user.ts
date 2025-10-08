/**
 * 用户认证工具
 */

import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/client';

export interface User {
  id: number;
  username: string;
  created_at: string;
}

/**
 * 注册或登录（合二为一）
 * - 如果用户名不存在：自动注册
 * - 如果用户名存在且密码正确：登录
 * - 如果用户名存在但密码错误：返回null
 */
export async function registerOrLogin(
  username: string,
  password: string
): Promise<User | null> {
  const db = await getDatabase();

  // 查询用户是否存在
  const existingResult = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
  const existingUser = existingResult.rows[0] as { id: number; username: string; password_hash: string; created_at: string } | undefined;

  if (existingUser) {
    // 用户存在，验证密码
    const isValid = await bcrypt.compare(password, existingUser.password_hash);
    if (!isValid) {
      return null; // 密码错误
    }

    return {
      id: existingUser.id,
      username: existingUser.username,
      created_at: existingUser.created_at,
    };
  }

  // 用户不存在，自动注册
  const passwordHash = await bcrypt.hash(password, 10);

  const insertResult = await db.execute(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );

  const userId = insertResult.lastInsertRowid!;

  const newUserResult = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
  const newUser = newUserResult.rows[0] as { id: number; username: string; created_at: string };

  return {
    id: newUser.id,
    username: newUser.username,
    created_at: newUser.created_at,
  };
}

/**
 * 根据ID获取用户
 */
export async function getUserById(userId: number): Promise<User | null> {
  const db = await getDatabase();

  const result = await db.execute('SELECT id, username, created_at FROM users WHERE id = ?', [userId]);
  const user = result.rows[0] as { id: number; username: string; created_at: string } | undefined;

  return user || null;
}

/**
 * 迁移session数据到用户
 */
export async function migrateSessionToUser(sessionId: string, userId: number): Promise<number> {
  const db = await getDatabase();

  const result = await db.execute(
    'UPDATE generated_names SET user_id = ? WHERE session_id = ? AND user_id IS NULL',
    [userId, sessionId]
  );

  return result.rowsAffected;
}
