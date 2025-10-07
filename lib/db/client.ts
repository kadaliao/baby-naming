/**
 * SQLite 数据库客户端（单例模式）
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database | null = null;

/**
 * 获取数据库实例（单例）
 */
export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // 数据库文件路径
  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'names.db');

  // 创建数据库连接
  db = new Database(dbPath);

  // 启用WAL模式（提升并发性能）
  db.pragma('journal_mode = WAL');

  // 初始化schema
  initializeSchema(db);

  console.log(`✅ 数据库已连接: ${dbPath}`);

  return db;
}

/**
 * 初始化数据库schema
 */
function initializeSchema(database: Database.Database): void {
  const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // 执行schema创建
  database.exec(schema);
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    console.log('✅ 数据库已关闭');
  }
}

/**
 * 清理并重新初始化数据库（仅用于测试）
 */
export function resetDatabase(): void {
  if (db) {
    db.exec('DROP TABLE IF EXISTS generated_names');
    initializeSchema(db);
    console.log('✅ 数据库已重置');
  }
}
