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
  const db = getDatabase();

  // 查询用户是否存在
  const existingUser = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username) as { id: number; username: string; password_hash: string; created_at: string } | undefined;

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

  const result = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(username, passwordHash);

  const userId = result.lastInsertRowid as number;

  const newUser = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId) as { id: number; username: string; created_at: string };

  return {
    id: newUser.id,
    username: newUser.username,
    created_at: newUser.created_at,
  };
}

/**
 * 根据ID获取用户
 */
export function getUserById(userId: number): User | null {
  const db = getDatabase();

  const user = db
    .prepare('SELECT id, username, created_at FROM users WHERE id = ?')
    .get(userId) as { id: number; username: string; created_at: string } | undefined;

  return user || null;
}

/**
 * 迁移session数据到用户
 */
export function migrateSessionToUser(sessionId: string, userId: number): number {
  const db = getDatabase();

  const result = db
    .prepare('UPDATE generated_names SET user_id = ? WHERE session_id = ? AND user_id IS NULL')
    .run(userId, sessionId);

  return result.changes;
}
