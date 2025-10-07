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

  // 运行migrations
  runMigrations(database);
}

/**
 * 运行数据库migrations
 */
function runMigrations(database: Database.Database): void {
  // 创建migrations表（记录已运行的migrations）
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 获取已运行的migrations
  const appliedMigrations = database
    .prepare('SELECT migration_name FROM schema_migrations')
    .all() as { migration_name: string }[];

  const appliedSet = new Set(appliedMigrations.map(m => m.migration_name));

  // 读取migrations目录
  const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations');
  const fs = require('fs');

  if (!fs.existsSync(migrationsDir)) {
    return; // 没有migrations目录，跳过
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort(); // 按文件名排序

  // 执行未运行的migrations
  for (const file of migrationFiles) {
    if (!appliedSet.has(file)) {
      console.log(`🔄 Running migration: ${file}`);
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

      try {
        database.exec(migrationSQL);
        database.prepare('INSERT INTO schema_migrations (migration_name) VALUES (?)').run(file);
        console.log(`✅ Migration ${file} applied`);
      } catch (error) {
        console.error(`❌ Migration ${file} failed:`, error);
        throw error;
      }
    }
  }
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
