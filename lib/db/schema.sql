-- 宝宝取名助手 - 数据库 Schema
-- 简化版：无用户系统，单表设计

-- 生成的名字表（包含所有必要信息）
CREATE TABLE IF NOT EXISTS generated_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- 会话标识（匿名用户支持，未来可迁移到user_id）
  session_id TEXT NOT NULL,

  -- 输入参数
  surname TEXT NOT NULL,
  gender TEXT,                    -- 'male' | 'female' | 'neutral'
  birth_date TEXT,                -- ISO 8601格式，如 '2024-01-15'
  preferences TEXT,               -- JSON数组: ["聪明智慧", "健康平安"]
  sources TEXT,                   -- JSON数组: ["poetry", "wuxing", "ai"]
  fixed_char TEXT,                -- 固定字（辈分字）
  fixed_position TEXT,            -- 'first' | 'second'

  -- 生成的名字
  full_name TEXT NOT NULL,
  first_name TEXT NOT NULL,

  -- 评分
  score_total INTEGER NOT NULL,   -- 总分 0-100
  score_wuxing INTEGER,           -- 五行评分 0-25
  score_yinlu INTEGER,            -- 音律评分 0-25
  score_zixing INTEGER,           -- 字形评分 0-20
  score_yuyi INTEGER,             -- 寓意评分 0-30
  grade TEXT,                     -- 'S' | 'A' | 'B' | 'C' | 'D'

  -- 评分详情（JSON）
  score_breakdown TEXT,           -- JSON: 详细的四维评分理由

  -- 来源信息
  source TEXT NOT NULL,           -- "poetry" | "wuxing" | "ai"
  source_detail TEXT,             -- 具体来源（诗句/算法描述）

  -- 用户操作
  is_favorite BOOLEAN DEFAULT 0,
  notes TEXT,                     -- 用户备注

  -- 时间戳
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_session_id ON generated_names(session_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON generated_names(created_at);
CREATE INDEX IF NOT EXISTS idx_is_favorite ON generated_names(is_favorite);

-- 更新时间戳触发器
CREATE TRIGGER IF NOT EXISTS update_generated_names_timestamp
AFTER UPDATE ON generated_names
BEGIN
  UPDATE generated_names
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- 未来扩展预留（用户系统实现后）
-- 迁移方案：ALTER TABLE generated_names ADD COLUMN user_id INTEGER;
-- 然后根据session_id迁移数据到user_id
