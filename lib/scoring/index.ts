/**
 * 综合评分系统 - 真实版
 * 整合四个评分维度
 */

import { scoreWuxing } from './wuxing';
import { scoreYinlu } from './yinlu';
import { scoreZixing } from './zixing';
import { scoreYuyi } from './yuyi';
import type { ScoreResult, ScoreDetail } from '@/types/name';

/**
 * 综合评分
 * @param fullName 全名（姓+名）
 * @param firstName 名字
 * @param preferences 用户偏好
 */
export async function comprehensiveScore(
  fullName: string,
  firstName: string,
  preferences: string[] = []
): Promise<ScoreResult> {
  // 并行计算四个维度评分
  const [wuxing, yinlu, zixing, yuyi] = await Promise.all([
    Promise.resolve(scoreWuxing(firstName)),
    Promise.resolve(scoreYinlu(fullName)),
    Promise.resolve(scoreZixing(firstName)),
    Promise.resolve(scoreYuyi(firstName, preferences)),
  ]);

  const total = wuxing.score + yinlu.score + zixing.score + yuyi.score;

  // 计算等级
  const grade = total >= 90 ? 'S' : total >= 80 ? 'A' : total >= 70 ? 'B' : total >= 60 ? 'C' : 'D';

  // 生成改进建议
  const suggestions = generateSuggestions({
    wuxing,
    yinlu,
    zixing,
    yuyi,
  });

  return {
    total,
    breakdown: { wuxing, yinlu, zixing, yuyi },
    grade,
    suggestions,
  };
}

/**
 * 生成改进建议
 */
function generateSuggestions(scores: {
  wuxing: ScoreDetail;
  yinlu: ScoreDetail;
  zixing: ScoreDetail;
  yuyi: ScoreDetail;
}): string[] {
  const suggestions: string[] = [];

  if (scores.wuxing.score < 15) {
    suggestions.push('建议选择五行平衡或相生的字');
  }

  if (scores.yinlu.score < 15) {
    suggestions.push('可以优化声调搭配，使读音更加和谐');
  }

  if (scores.zixing.score < 12) {
    suggestions.push('建议选择笔画适中、结构平衡的字');
  }

  if (scores.yuyi.score < 20) {
    suggestions.push('可以从诗词典故中寻找更有文化内涵的字');
  }

  if (suggestions.length === 0) {
    suggestions.push('这是一个非常好的名字，各方面都很出色！');
  }

  return suggestions;
}
