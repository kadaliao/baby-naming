/**
 * 字形评分算法 - 真实版
 * 基于笔画数据
 */

import { getCharStrokes } from '@/lib/utils/data-loader';
import type { ScoreDetail } from '@/types/name';

export function scoreZixing(firstName: string): ScoreDetail {
  const chars = [...firstName];
  const strokesData = chars.map((char) => getCharStrokes(char));

  // 如果有字查不到笔画数据，降级处理
  if (strokesData.some((s) => s === null)) {
    return {
      score: 12,
      reason: '部分汉字缺少笔画数据，使用默认评分',
      details: {
        note: '需要补充笔画数据库',
      },
    };
  }

  const strokes = strokesData as number[];
  let score = 0;
  const reasons: string[] = [];

  // ========== 1. 笔画吉凶评分 (10分) ==========
  const totalStrokes = strokes.reduce((a, b) => a + b, 0);
  const strokeLuck = analyzeStrokeLuck(totalStrokes);

  score += strokeLuck.score;
  reasons.push(strokeLuck.reason);

  // ========== 2. 书写美观度评分 (10分) ==========
  const writeScore = analyzeWriteability(strokes);

  score += writeScore.score;
  reasons.push(writeScore.reason);

  return {
    score: Math.min(score, 20),
    reason: reasons.join('；'),
    details: {
      strokes,
      totalStrokes,
      avgStrokes: (totalStrokes / strokes.length).toFixed(1),
    },
  };
}

/**
 * 分析笔画吉凶
 * 根据姓名学81数理（简化版）
 */
function analyzeStrokeLuck(totalStrokes: number): { score: number; reason: string } {
  // 姓名学吉数（81数理中的吉数，简化版）
  const luckyNumbers = [
    1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 29, 31, 32, 33, 35, 37, 39, 41, 45,
    47, 48, 52, 57, 63, 65, 67, 68, 81,
  ];

  // 取模81（姓名学81数理）
  const num = totalStrokes % 81 || 81;

  if (luckyNumbers.includes(num)) {
    return {
      score: 10,
      reason: `笔画数${totalStrokes}画，数理吉利`,
    };
  } else {
    return {
      score: 6,
      reason: `笔画数${totalStrokes}画，数理一般`,
    };
  }
}

/**
 * 分析书写美观度
 * 原则：
 * 1. 笔画适中（每个字6-16画）最佳
 * 2. 笔画差异不宜过大
 */
function analyzeWriteability(strokes: number[]): { score: number; reason: string } {
  // 检查每个字的笔画是否适中
  const allModerate = strokes.every((s) => s >= 6 && s <= 16);
  const mostModerate = strokes.filter((s) => s >= 6 && s <= 16).length >= strokes.length - 1;

  // 检查笔画差异
  const maxStroke = Math.max(...strokes);
  const minStroke = Math.min(...strokes);
  const diff = maxStroke - minStroke;

  let score = 5; // 基础分
  let reason = '';

  if (allModerate) {
    score += 3;
    reason = '笔画适中，书写美观';
  } else if (mostModerate) {
    score += 2;
    reason = '笔画较为适中';
  } else {
    score += 1;
    reason = '部分字笔画偏多或偏少';
  }

  // 笔画差异评分
  if (diff <= 5) {
    score += 2;
    reason += '，笔画平衡';
  } else if (diff <= 10) {
    score += 1;
    reason += '，笔画差异适中';
  } else {
    reason += '，笔画差异较大';
  }

  return {
    score: Math.min(score, 10),
    reason,
  };
}
