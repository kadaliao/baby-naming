import type { ScoreResult, ScoreDetail } from '@/types/name';

/**
 * 简化版评分算法
 * 目前使用基础规则，后续会实现完整的五行、音律、字形、寓意评分
 */

/**
 * 计算名字的综合评分
 */
export async function calculateScore(
  fullName: string,
  firstName: string,
  preferences: string[] = []
): Promise<ScoreResult> {
  // 简化版评分，基于一些基本规则
  const wuxingScore = scoreWuxingSimple(firstName);
  const yinluScore = scoreYinluSimple(fullName);
  const zixingScore = scoreZixingSimple(firstName);
  const yuyiScore = scoreYuyiSimple(firstName, preferences);

  const total = wuxingScore.score + yinluScore.score + zixingScore.score + yuyiScore.score;

  // 计算等级
  const grade =
    total >= 90 ? 'S' :
    total >= 80 ? 'A' :
    total >= 70 ? 'B' :
    total >= 60 ? 'C' : 'D';

  // 生成建议
  const suggestions = generateSuggestions({
    wuxing: wuxingScore,
    yinlu: yinluScore,
    zixing: zixingScore,
    yuyi: yuyiScore,
  });

  return {
    total,
    breakdown: {
      wuxing: wuxingScore,
      yinlu: yinluScore,
      zixing: zixingScore,
      yuyi: yuyiScore,
    },
    grade,
    suggestions,
  };
}

/**
 * 简化版五行评分
 * TODO: 实现完整的八字五行计算
 */
function scoreWuxingSimple(firstName: string): ScoreDetail {
  // 简化评分：基于名字长度和字数
  const charCount = firstName.length;
  let score = 15; // 基础分

  if (charCount === 2) {
    score += 5; // 双字名加分
  } else if (charCount === 1) {
    score += 3; // 单字名略低
  }

  return {
    score: Math.min(score, 25),
    reason: '五行评分（简化版）：名字字数适中',
    details: {
      charCount,
      note: '完整五行分析需要提供出生日期时间',
    },
  };
}

/**
 * 简化版音律评分
 * TODO: 实现完整的拼音声调分析
 */
function scoreYinluSimple(fullName: string): ScoreDetail {
  const charCount = fullName.length;
  let score = 15; // 基础分

  // 简单规则：名字总长度适中
  if (charCount === 3) {
    score += 8; // 三字名
  } else if (charCount === 2 || charCount === 4) {
    score += 5;
  }

  return {
    score: Math.min(score, 25),
    reason: '音律评分（简化版）：名字长度合适，读音流畅',
    details: {
      charCount,
      note: '完整音律分析将考虑拼音声调、韵母搭配等',
    },
  };
}

/**
 * 简化版字形评分
 * TODO: 实现完整的笔画、结构分析
 */
function scoreZixingSimple(firstName: string): ScoreDetail {
  const charCount = firstName.length;
  let score = 12; // 基础分

  // 简单规则
  if (charCount >= 1 && charCount <= 2) {
    score += 5;
  }

  return {
    score: Math.min(score, 20),
    reason: '字形评分（简化版）：字形结构平衡',
    details: {
      charCount,
      note: '完整字形分析将考虑笔画数、结构平衡等',
    },
  };
}

/**
 * 简化版寓意评分
 * TODO: 实现完整的字义分析和诗词查询
 */
function scoreYuyiSimple(firstName: string, preferences: string[]): ScoreDetail {
  let score = 20; // 基础分

  // 如果有偏好，假设名字符合部分偏好
  if (preferences.length > 0) {
    score += Math.min(preferences.length * 2, 10);
  }

  return {
    score: Math.min(score, 30),
    reason: '寓意评分（简化版）：名字寓意美好',
    details: {
      preferences,
      note: '完整寓意分析将考虑字义、诗词典故、文化内涵等',
    },
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
    suggestions.push('建议提供出生日期时间，以便进行精准的五行分析');
  }

  if (scores.yinlu.score < 15) {
    suggestions.push('可以优化声调搭配，使读音更加和谐');
  }

  if (scores.zixing.score < 12) {
    suggestions.push('建议选择字形结构更平衡的字');
  }

  if (scores.yuyi.score < 20) {
    suggestions.push('可以从诗词典故中寻找更有文化内涵的字');
  }

  if (suggestions.length === 0) {
    suggestions.push('这是一个非常好的名字，各方面都很出色！');
  }

  return suggestions;
}
