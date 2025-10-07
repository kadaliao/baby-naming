-- Migration 001: 添加用户系统

-- 创建users表（简化版）
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 在generated_names表中添加user_id列（可选）
ALTER TABLE generated_names ADD COLUMN user_id INTEGER;

-- 创建user_id索引
CREATE INDEX IF NOT EXISTS idx_user_id ON generated_names(user_id);

-- 创建users表的更新时间戳触发器
CREATE TRIGGER IF NOT EXISTS update_users_timestamp
AFTER UPDATE ON users
BEGIN
  UPDATE users
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
