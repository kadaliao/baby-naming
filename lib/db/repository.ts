/**
 * 数据库操作层（Repository Pattern）
 * Hybrid 模式：支持本地 SQLite 和 Turso
 */

import { getDatabase } from './client';
import type { NameCandidate, ScoreResult } from '@/types/name';

export interface GeneratedNameRecord {
  id: number;
  session_id: string;
  user_id?: number;
  surname: string;
  gender?: string;
  birth_date?: string;
  preferences?: string; // JSON
  sources?: string; // JSON
  fixed_char?: string;
  fixed_position?: string;
  full_name: string;
  first_name: string;
  score_total: number;
  score_wuxing?: number;
  score_yinlu?: number;
  score_zixing?: number;
  score_yuyi?: number;
  grade: string;
  score_breakdown?: string; // JSON
  source: string;
  source_detail?: string;
  is_favorite: number; // SQLite boolean = 0/1
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaveNameInput {
  sessionId: string;
  userId?: number;
  surname: string;
  gender?: string;
  birthDate?: Date;
  preferences?: string[];
  sources?: string[];
  fixedChar?: string;
  fixedPosition?: 'first' | 'second';
  candidate: NameCandidate;
  score: ScoreResult;
}

/**
 * 保存生成的名字
 */
export async function saveName(input: SaveNameInput): Promise<number> {
  const db = await getDatabase();

  const sql = `
    INSERT INTO generated_names (
      session_id, user_id, surname, gender, birth_date, preferences, sources,
      fixed_char, fixed_position,
      full_name, first_name,
      score_total, score_wuxing, score_yinlu, score_zixing, score_yuyi, grade,
      score_breakdown, source, source_detail
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `;

  const result = await db.execute(sql, [
    input.sessionId,
    input.userId || null,
    input.surname,
    input.gender || null,
    input.birthDate ? input.birthDate.toISOString() : null,
    input.preferences ? JSON.stringify(input.preferences) : null,
    input.sources ? JSON.stringify(input.sources) : null,
    input.fixedChar || null,
    input.fixedPosition || null,
    input.candidate.fullName,
    input.candidate.firstName,
    input.score.total,
    input.score.breakdown.wuxing.score,
    input.score.breakdown.yinlu.score,
    input.score.breakdown.zixing.score,
    input.score.breakdown.yuyi.score,
    input.score.grade,
    JSON.stringify(input.score.breakdown),
    input.candidate.source,
    input.candidate.sourceDetail || null,
  ]);

  return result.lastInsertRowid!;
}

/**
 * 批量保存生成的名字
 */
export async function saveNames(inputs: SaveNameInput[]): Promise<number[]> {
  const db = await getDatabase();
  const ids: number[] = [];

  const statements = inputs.map(input => ({
    sql: `
      INSERT INTO generated_names (
        session_id, user_id, surname, gender, birth_date, preferences, sources,
        fixed_char, fixed_position,
        full_name, first_name,
        score_total, score_wuxing, score_yinlu, score_zixing, score_yuyi, grade,
        score_breakdown, source, source_detail
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      input.sessionId,
      input.userId || null,
      input.surname,
      input.gender || null,
      input.birthDate ? input.birthDate.toISOString() : null,
      input.preferences ? JSON.stringify(input.preferences) : null,
      input.sources ? JSON.stringify(input.sources) : null,
      input.fixedChar || null,
      input.fixedPosition || null,
      input.candidate.fullName,
      input.candidate.firstName,
      input.score.total,
      input.score.breakdown.wuxing.score,
      input.score.breakdown.yinlu.score,
      input.score.breakdown.zixing.score,
      input.score.breakdown.yuyi.score,
      input.score.grade,
      JSON.stringify(input.score.breakdown),
      input.candidate.source,
      input.candidate.sourceDetail || null,
    ],
  }));

  const results = await db.batch(statements);

  // Extract lastInsertRowid from batch results
  // Note: This assumes batch returns results with lastInsertRowid
  for (const result of results) {
    if (result.lastInsertRowid) {
      ids.push(Number(result.lastInsertRowid));
    }
  }

  return ids;
}

/**
 * 获取历史记录（按session或user）
 * 去重逻辑：相同姓名只保留最早的记录，收藏状态合并（任意一条收藏即收藏）
 */
export async function getHistory(
  identifier: { sessionId?: string; userId?: number },
  options?: {
    limit?: number;
    offset?: number;
    onlyFavorites?: boolean;
  }
): Promise<GeneratedNameRecord[]> {
  const db = await getDatabase();

  let whereClause = '';
  let params: (string | number)[] = [];

  // 优先使用userId
  if (identifier.userId) {
    whereClause = 'user_id = ?';
    params.push(identifier.userId);
  } else if (identifier.sessionId) {
    whereClause = 'session_id = ?';
    params.push(identifier.sessionId);
  } else {
    return []; // 没有提供标识符
  }

  // 使用窗口函数去重：按姓名分组，保留最早记录，合并收藏状态
  let query = `
    WITH ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (
          PARTITION BY surname, first_name
          ORDER BY created_at ASC
        ) as rn,
        MAX(is_favorite) OVER (
          PARTITION BY surname, first_name
        ) as merged_favorite
      FROM generated_names
      WHERE ${whereClause}
    )
    SELECT
      id, session_id, user_id, surname, gender, birth_date, preferences, sources,
      fixed_char, fixed_position, full_name, first_name,
      score_total, score_wuxing, score_yinlu, score_zixing, score_yuyi, grade,
      score_breakdown, source, source_detail,
      merged_favorite as is_favorite,
      notes, created_at, updated_at
    FROM ranked
    WHERE rn = 1
  `;

  if (options?.onlyFavorites) {
    query += ' AND merged_favorite = 1';
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  if (options?.offset) {
    query += ` OFFSET ${options.offset}`;
  }

  const result = await db.execute(query, params);
  return result.rows as GeneratedNameRecord[];
}

/**
 * 切换收藏状态
 * 同步更新所有同名记录，保证数据一致性
 */
export async function toggleFavorite(id: number): Promise<boolean> {
  const db = await getDatabase();

  // 先查出这条记录的姓名
  const getResult = await db.execute('SELECT surname, first_name FROM generated_names WHERE id = ?', [id]);
  const record = getResult.rows[0] as { surname: string; first_name: string } | undefined;

  if (!record) {
    return false;
  }

  // 更新所有同名记录
  const updateResult = await db.execute(
    `
    UPDATE generated_names
    SET is_favorite = CASE
      WHEN is_favorite = 1 THEN 0
      ELSE 1
    END
    WHERE surname = ? AND first_name = ?
  `,
    [record.surname, record.first_name]
  );

  return updateResult.rowsAffected > 0;
}

/**
 * 添加备注
 */
export async function addNote(id: number, note: string): Promise<boolean> {
  const db = await getDatabase();

  const result = await db.execute(
    `
    UPDATE generated_names
    SET notes = ?
    WHERE id = ?
  `,
    [note, id]
  );

  return result.rowsAffected > 0;
}

/**
 * 删除记录
 * 删除所有同名记录
 */
export async function deleteName(id: number): Promise<boolean> {
  const db = await getDatabase();

  // 先查出这条记录的姓名
  const getResult = await db.execute('SELECT surname, first_name FROM generated_names WHERE id = ?', [id]);
  const record = getResult.rows[0] as { surname: string; first_name: string } | undefined;

  if (!record) {
    return false;
  }

  // 删除所有同名记录
  const deleteResult = await db.execute('DELETE FROM generated_names WHERE surname = ? AND first_name = ?', [
    record.surname,
    record.first_name,
  ]);

  return deleteResult.rowsAffected > 0;
}

/**
 * 获取统计信息
 * 基于去重后的数据计算（相同姓名只算一次）
 */
export async function getStats(identifier: { sessionId?: string; userId?: number }): Promise<{
  total: number;
  favorites: number;
  avgScore: number;
  bySources: Record<string, number>;
}> {
  const db = await getDatabase();

  let whereClause = '';
  let param: string | number;

  if (identifier.userId) {
    whereClause = 'user_id = ?';
    param = identifier.userId;
  } else if (identifier.sessionId) {
    whereClause = 'session_id = ?';
    param = identifier.sessionId;
  } else {
    return { total: 0, favorites: 0, avgScore: 0, bySources: {} };
  }

  // 使用窗口函数去重后计数
  const totalResult = await db.execute(
    `
    WITH ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY surname, first_name ORDER BY created_at ASC) as rn
      FROM generated_names
      WHERE ${whereClause}
    )
    SELECT COUNT(*) as count FROM ranked WHERE rn = 1
  `,
    [param]
  );
  const total = (totalResult.rows[0] as { count: number }).count;

  const favResult = await db.execute(
    `
    WITH ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY surname, first_name ORDER BY created_at ASC) as rn,
        MAX(is_favorite) OVER (PARTITION BY surname, first_name) as merged_favorite
      FROM generated_names
      WHERE ${whereClause}
    )
    SELECT COUNT(*) as count FROM ranked WHERE rn = 1 AND merged_favorite = 1
  `,
    [param]
  );
  const favorites = (favResult.rows[0] as { count: number }).count;

  const avgResult = await db.execute(
    `
    WITH ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY surname, first_name ORDER BY created_at ASC) as rn
      FROM generated_names
      WHERE ${whereClause}
    )
    SELECT AVG(score_total) as avg FROM ranked WHERE rn = 1
  `,
    [param]
  );
  const avgScore = Math.round((avgResult.rows[0] as { avg: number }).avg || 0);

  const sourceResult = await db.execute(
    `
    WITH ranked AS (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY surname, first_name ORDER BY created_at ASC) as rn
      FROM generated_names
      WHERE ${whereClause}
    )
    SELECT source, COUNT(*) as count FROM ranked WHERE rn = 1 GROUP BY source
  `,
    [param]
  );
  const sources = sourceResult.rows as { source: string; count: number }[];
  const bySources: Record<string, number> = {};
  sources.forEach((s) => {
    bySources[s.source] = s.count;
  });

  return { total, favorites, avgScore, bySources };
}
