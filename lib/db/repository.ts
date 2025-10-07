/**
 * 数据库操作层（Repository Pattern）
 */

import { getDatabase } from './client';
import type { NameCandidate, ScoreResult } from '@/types/name';

export interface GeneratedNameRecord {
  id: number;
  session_id: string;
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
export function saveName(input: SaveNameInput): number {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO generated_names (
      session_id, surname, gender, birth_date, preferences, sources,
      fixed_char, fixed_position,
      full_name, first_name,
      score_total, score_wuxing, score_yinlu, score_zixing, score_yuyi, grade,
      score_breakdown, source, source_detail
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  const result = stmt.run(
    input.sessionId,
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
    input.candidate.sourceDetail || null
  );

  return result.lastInsertRowid as number;
}

/**
 * 批量保存生成的名字
 */
export function saveNames(inputs: SaveNameInput[]): number[] {
  const db = getDatabase();
  const ids: number[] = [];

  const transaction = db.transaction(() => {
    for (const input of inputs) {
      ids.push(saveName(input));
    }
  });

  transaction();
  return ids;
}

/**
 * 获取历史记录（按session或user）
 */
export function getHistory(
  identifier: { sessionId?: string; userId?: number },
  options?: {
    limit?: number;
    offset?: number;
    onlyFavorites?: boolean;
  }
): GeneratedNameRecord[] {
  const db = getDatabase();

  let query = 'SELECT * FROM generated_names WHERE ';
  let params: (string | number)[] = [];

  // 优先使用userId
  if (identifier.userId) {
    query += 'user_id = ?';
    params.push(identifier.userId);
  } else if (identifier.sessionId) {
    query += 'session_id = ?';
    params.push(identifier.sessionId);
  } else {
    return []; // 没有提供标识符
  }

  if (options?.onlyFavorites) {
    query += ' AND is_favorite = 1';
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`;
  }

  if (options?.offset) {
    query += ` OFFSET ${options.offset}`;
  }

  const stmt = db.prepare(query);
  return stmt.all(...params) as GeneratedNameRecord[];
}

/**
 * 切换收藏状态
 */
export function toggleFavorite(id: number): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE generated_names
    SET is_favorite = CASE
      WHEN is_favorite = 1 THEN 0
      ELSE 1
    END
    WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * 添加备注
 */
export function addNote(id: number, note: string): boolean {
  const db = getDatabase();

  const stmt = db.prepare(`
    UPDATE generated_names
    SET notes = ?
    WHERE id = ?
  `);

  const result = stmt.run(note, id);
  return result.changes > 0;
}

/**
 * 删除记录
 */
export function deleteName(id: number): boolean {
  const db = getDatabase();

  const stmt = db.prepare('DELETE FROM generated_names WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * 获取统计信息
 */
export function getStats(identifier: { sessionId?: string; userId?: number }): {
  total: number;
  favorites: number;
  avgScore: number;
  bySources: Record<string, number>;
} {
  const db = getDatabase();

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

  const totalStmt = db.prepare(`SELECT COUNT(*) as count FROM generated_names WHERE ${whereClause}`);
  const total = (totalStmt.get(param) as { count: number }).count;

  const favStmt = db.prepare(`SELECT COUNT(*) as count FROM generated_names WHERE ${whereClause} AND is_favorite = 1`);
  const favorites = (favStmt.get(param) as { count: number }).count;

  const avgStmt = db.prepare(`SELECT AVG(score_total) as avg FROM generated_names WHERE ${whereClause}`);
  const avgScore = Math.round((avgStmt.get(param) as { avg: number }).avg || 0);

  const sourceStmt = db.prepare(`SELECT source, COUNT(*) as count FROM generated_names WHERE ${whereClause} GROUP BY source`);
  const sources = sourceStmt.all(param) as { source: string; count: number }[];
  const bySources: Record<string, number> = {};
  sources.forEach((s) => {
    bySources[s.source] = s.count;
  });

  return { total, favorites, avgScore, bySources };
}
