/**
 * 五行评分算法 - 简化版
 * 基于五行数据，暂不包含八字计算
 */

import { getCharWuxing } from '@/lib/utils/data-loader';
import type { ScoreDetail } from '@/types/name';

export function scoreWuxing(firstName: string): ScoreDetail {
  const chars = [...firstName];
  const wuxingData = chars.map((char) => getCharWuxing(char));

  // 如果有字查不到五行数据，降级处理
  if (wuxingData.some((w) => w === null)) {
    return {
      score: 15,
      reason: '部分汉字缺少五行数据，使用默认评分',
      details: {
        note: '需要补充五行数据库',
      },
    };
  }

  const wuxings = wuxingData as string[];
  let score = 0;
  const reasons: string[] = [];

  // ========== 1. 五行平衡度评分 (15分) ==========
  const balanceResult = analyzeWuxingBalance(wuxings);
  score += balanceResult.score;
  reasons.push(balanceResult.reason);

  // ========== 2. 五行相生评分 (10分) ==========
  const shengResult = analyzeWuxingSheng(wuxings);
  score += shengResult.score;
  reasons.push(shengResult.reason);

  return {
    score: Math.min(score, 25),
    reason: reasons.join('；'),
    details: {
      wuxings,
      wuxingCounts: countWuxing(wuxings),
      note: '未包含八字分析，如需精准五行评分请提供出生日期',
    },
  };
}

/**
 * 分析五行平衡度
 * 原则：名字中的五行不宜过于单一
 */
function analyzeWuxingBalance(wuxings: string[]): { score: number; reason: string } {
  const counts = countWuxing(wuxings);
  const uniqueCount = Object.keys(counts).length;

  if (uniqueCount === wuxings.length && wuxings.length >= 2) {
    // 所有字五行都不同，平衡最佳
    return {
      score: 15,
      reason: `五行${wuxings.join('、')}，元素多样平衡`,
    };
  } else if (uniqueCount >= 2) {
    // 有2种以上五行，良好
    return {
      score: 12,
      reason: `五行${wuxings.join('、')}，元素较为平衡`,
    };
  } else {
    // 只有1种五行，一般
    return {
      score: 8,
      reason: `五行均为${wuxings[0]}，建议增加其他元素`,
    };
  }
}

/**
 * 分析五行相生关系
 * 相生顺序：金生水、水生木、木生火、火生土、土生金
 */
function analyzeWuxingSheng(wuxings: string[]): { score: number; reason: string } {
  if (wuxings.length < 2) {
    return {
      score: 5,
      reason: '单字名，无法分析五行相生',
    };
  }

  // 五行相生关系表
  const shengMap: Record<string, string> = {
    金: '水',
    水: '木',
    木: '火',
    火: '土',
    土: '金',
  };

  // 检查相邻两字是否相生
  let shengCount = 0;
  for (let i = 0; i < wuxings.length - 1; i++) {
    if (shengMap[wuxings[i]] === wuxings[i + 1]) {
      shengCount++;
    }
  }

  if (shengCount === wuxings.length - 1) {
    // 全部相生
    return {
      score: 10,
      reason: '五行相生，气场和谐流畅',
    };
  } else if (shengCount > 0) {
    // 部分相生
    return {
      score: 7,
      reason: '五行部分相生',
    };
  } else {
    // 无相生关系（可能相克或独立）
    return {
      score: 5,
      reason: '五行独立，无明显相生关系',
    };
  }
}

/**
 * 统计五行出现次数
 */
function countWuxing(wuxings: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const wx of wuxings) {
    counts[wx] = (counts[wx] || 0) + 1;
  }
  return counts;
}
