/**
 * 寓意评分算法 - 真实版
 * 基于诗词数据
 */

import { getPoemsContainingChar } from '@/lib/utils/data-loader';
import type { ScoreDetail } from '@/types/name';

export function scoreYuyi(firstName: string, preferences: string[] = []): ScoreDetail {
  const chars = [...firstName];
  let score = 0;
  const reasons: string[] = [];
  const poetrySources: string[] = [];

  // ========== 1. 诗词典故评分 (20分) ==========
  let poetryScore = 0;
  let foundPoetryCount = 0;

  for (const char of chars) {
    const poems = getPoemsContainingChar(char);
    if (poems.length > 0) {
      foundPoetryCount++;
      const poem = poems[0]; // 取第一首诗
      poetrySources.push(`"${char}"字出自${poem.author}《${poem.title}》：${poem.content}`);
    }
  }

  if (foundPoetryCount === chars.length) {
    poetryScore = 20;
    reasons.push(`名字每个字都有诗词出处，富有文化内涵`);
  } else if (foundPoetryCount > 0) {
    poetryScore = 12;
    reasons.push(`${foundPoetryCount}/${chars.length}个字有诗词出处`);
  } else {
    poetryScore = 8;
    reasons.push('暂无诗词出处');
  }

  score += poetryScore;

  // ========== 2. 用户偏好匹配评分 (10分) ==========
  if (preferences && preferences.length > 0) {
    const preferenceResult = matchPreferences(firstName, preferences);
    score += preferenceResult.score;
    reasons.push(preferenceResult.reason);
  } else {
    score += 5; // 无偏好时默认5分
    reasons.push('未指定偏好');
  }

  return {
    score: Math.min(score, 30),
    reason: reasons.join('；'),
    details: {
      poetrySources,
      preferences,
      foundPoetryCount,
    },
  };
}

/**
 * 匹配用户偏好
 */
function matchPreferences(
  firstName: string,
  preferences: string[]
): { score: number; reason: string } {
  // 偏好关键字映射
  const preferenceKeywords: Record<string, string[]> = {
    聪明智慧: ['智', '慧', '明', '聪', '睿', '思', '颖', '敏'],
    品德高尚: ['德', '善', '仁', '义', '贤', '诚', '忠', '孝'],
    健康平安: ['康', '健', '安', '平', '泰', '宁', '祥', '福'],
    事业成功: ['成', '功', '达', '业', '昌', '盛', '兴', '荣'],
    文雅诗意: ['文', '雅', '诗', '韵', '涵', '墨', '书', '画'],
    活泼开朗: ['朗', '阳', '明', '欢', '乐', '悦', '畅', '欣'],
    勇敢坚强: ['勇', '刚', '毅', '坚', '强', '威', '豪', '烈'],
  };

  const chars = [...firstName];
  let matchCount = 0;

  for (const pref of preferences) {
    const keywords = preferenceKeywords[pref] || [];
    if (chars.some((char) => keywords.includes(char))) {
      matchCount++;
    }
  }

  if (matchCount === preferences.length) {
    return {
      score: 10,
      reason: '完全符合您的偏好要求',
    };
  } else if (matchCount > 0) {
    return {
      score: 6,
      reason: `部分符合您的偏好（${matchCount}/${preferences.length}项）`,
    };
  } else {
    return {
      score: 3,
      reason: '与偏好匹配度较低',
    };
  }
}
