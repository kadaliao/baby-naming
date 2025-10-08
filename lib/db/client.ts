/**
 * 数据库客户端（Hybrid 模式）
 * - 本地开发：better-sqlite3（文件数据库）
 * - 生产环境：Turso/LibSQL（serverless）
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// 定义统一的数据库接口
export interface DatabaseClient {
  execute(sql: string, args?: any[]): Promise<{ rows: any[]; rowsAffected: number; lastInsertRowid?: number }>;
  batch(statements: Array<{ sql: string; args?: any[] }>): Promise<any[]>;
  close(): Promise<void>;
}

let db: DatabaseClient | null = null;

/**
 * 获取数据库实例（单例）
 */
export async function getDatabase(): Promise<DatabaseClient> {
  if (db) {
    return db;
  }

  // 检查环境：TURSO_URL 存在 → 用 Turso，否则用本地 SQLite
  const tursoUrl = process.env.TURSO_URL;

  if (tursoUrl) {
    // 生产环境：使用 Turso (LibSQL)
    db = await createTursoClient(tursoUrl, process.env.TURSO_AUTH_TOKEN);
    console.log('✅ 数据库已连接: Turso (serverless)');
  } else {
    // 本地环境：使用 better-sqlite3
    db = await createSQLiteClient();
    console.log('✅ 数据库已连接: SQLite (本地)');
  }

  // 初始化 schema
  await initializeSchema(db);

  return db;
}

/**
 * 创建 Turso 客户端（LibSQL）
 */
async function createTursoClient(url: string, authToken?: string): Promise<DatabaseClient> {
  const { createClient } = await import('@libsql/client');

  const client = createClient({
    url,
    authToken,
  });

  return {
    async execute(sql: string, args?: any[]) {
      const result = await client.execute({ sql, args: args || [] });
      return {
        rows: result.rows as any[],
        rowsAffected: result.rowsAffected,
        lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
      };
    },

    async batch(statements: Array<{ sql: string; args?: any[] }>) {
      const results = await client.batch(statements.map(stmt => ({ sql: stmt.sql, args: stmt.args || [] })));
      return results;
    },

    async close() {
      client.close();
    },
  };
}

/**
 * 创建 SQLite 客户端（better-sqlite3）
 */
async function createSQLiteClient(): Promise<DatabaseClient> {
  const Database = (await import('better-sqlite3')).default;

  const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'names.db');
  const sqlite = new Database(dbPath);

  // 启用 WAL 模式
  sqlite.pragma('journal_mode = WAL');

  return {
    async execute(sql: string, args?: any[]) {
      // 检查是否为多语句 SQL（包含分号，且不是注释）
      const hasMultipleStatements = sql.includes(';') && sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--')).length > 1;

      if (hasMultipleStatements) {
        // 多语句用 exec（不支持参数绑定）
        sqlite.exec(sql);
        return { rows: [], rowsAffected: 0 };
      }

      // 单语句：判断是 SELECT 还是 INSERT/UPDATE/DELETE
      const trimmedSql = sql.trim().toUpperCase();

      if (trimmedSql.startsWith('SELECT') || trimmedSql.startsWith('WITH')) {
        const stmt = sqlite.prepare(sql);
        const rows = stmt.all(...(args || []));
        return { rows, rowsAffected: 0 };
      } else {
        const stmt = sqlite.prepare(sql);
        const result = stmt.run(...(args || []));
        return {
          rows: [],
          rowsAffected: result.changes,
          lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
        };
      }
    },

    async batch(statements: Array<{ sql: string; args?: any[] }>) {
      const results: any[] = [];
      const transaction = sqlite.transaction(() => {
        for (const stmt of statements) {
          const prepared = sqlite.prepare(stmt.sql);
          const result = prepared.run(...(stmt.args || []));
          results.push(result);
        }
      });
      transaction();
      return results;
    },

    async close() {
      sqlite.close();
    },
  };
}

/**
 * 初始化数据库 schema
 */
async function initializeSchema(database: DatabaseClient): Promise<void> {
  const schemaPath = join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // 执行 schema 创建
  await database.execute(schema);

  // 运行 migrations
  await runMigrations(database);
}

/**
 * 运行数据库 migrations
 */
async function runMigrations(database: DatabaseClient): Promise<void> {
  // 创建 migrations 表
  await database.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 获取已运行的 migrations
  const result = await database.execute('SELECT migration_name FROM schema_migrations');
  const appliedSet = new Set(result.rows.map((r: any) => r.migration_name));

  // 读取 migrations 目录
  const migrationsDir = join(process.cwd(), 'lib', 'db', 'migrations');
  const fs = await import('fs');

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith('.sql'))
    .sort();

  // 执行未运行的 migrations
  for (const file of migrationFiles) {
    if (!appliedSet.has(file)) {
      console.log(`🔄 Running migration: ${file}`);
      const migrationPath = join(migrationsDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

      try {
        await database.execute(migrationSQL);
        await database.execute('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file]);
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
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ 数据库已关闭');
  }
}

/**
 * 清理并重新初始化数据库（仅用于测试）
 */
export async function resetDatabase(): Promise<void> {
  if (db) {
    await db.execute('DROP TABLE IF EXISTS generated_names');
    await initializeSchema(db);
    console.log('✅ 数据库已重置');
  }
}
