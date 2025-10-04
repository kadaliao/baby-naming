/**
 * 音律评分算法 - 真实版
 * 基于拼音声调、韵母分析
 */

import { getCharPinyin } from '@/lib/utils/data-loader';
import type { ScoreDetail } from '@/types/name';

export function scoreYinlu(fullName: string): ScoreDetail {
  const chars = [...fullName];
  const pinyinData = chars.map((char) => getCharPinyin(char));

  // 如果有字查不到拼音数据，降级处理
  if (pinyinData.some((p) => p === null)) {
    return {
      score: 15,
      reason: '部分汉字缺少拼音数据，使用默认评分',
      details: {
        note: '需要补充拼音数据库',
      },
    };
  }

  const tones = pinyinData.map((p) => p!.tone);
  const yunmus = pinyinData.map((p) => p!.yunmu);

  let score = 0;
  const reasons: string[] = [];

  // ========== 1. 声调搭配评分 (15分) ==========
  const tonePattern = analyzeTonePattern(tones);

  if (tonePattern === 'perfect') {
    score += 15;
    reasons.push('声调搭配完美，平仄和谐，富有韵律美');
  } else if (tonePattern === 'good') {
    score += 10;
    reasons.push('声调搭配良好，读起来顺口');
  } else {
    score += 6;
    reasons.push('声调搭配一般');
  }

  // ========== 2. 韵母搭配评分 (10分) ==========
  const yunmuScore = analyzeYunmu(yunmus);
  score += yunmuScore;

  if (yunmuScore >= 8) {
    reasons.push('韵母和谐，发音流畅自然');
  } else if (yunmuScore >= 5) {
    reasons.push('韵母搭配尚可');
  } else {
    reasons.push('韵母相近，建议调整避免拗口');
  }

  return {
    score: Math.min(score, 25),
    reason: reasons.join('；'),
    details: {
      tones,
      tonePattern,
      yunmus,
      pinyins: pinyinData.map((p) => p!.pinyin),
    },
  };
}

/**
 * 分析声调模式
 * 平声：1声、2声
 * 仄声：3声、4声
 */
function analyzeTonePattern(tones: number[]): 'perfect' | 'good' | 'normal' {
  if (tones.length === 3) {
    const [t1, , t3] = tones;

    // 转换为平仄模式：P=平声(1,2), Z=仄声(3,4)
    const pattern = tones.map((t) => (t <= 2 ? 'P' : 'Z')).join('');

    // 理想模式：平仄仄(PZZ)、仄平平(ZPP)、平平仄(PPZ)、仄仄平(ZZP)
    const perfectPatterns = ['PZZ', 'ZPP', 'PPZ', 'ZZP'];
    if (perfectPatterns.includes(pattern)) {
      return 'perfect';
    }

    // 良好模式：首尾声调不同
    if (t1 !== t3) {
      return 'good';
    }
  }

  // 其他长度的名字，简单判断
  if (tones.length === 2) {
    // 双字名：不同声调即可
    return tones[0] !== tones[1] ? 'good' : 'normal';
  }

  return 'normal';
}

/**
 * 分析韵母搭配
 * 原则：
 * 1. 避免叠韵（所有韵母相同）
 * 2. 适度变化最佳
 */
function analyzeYunmu(yunmus: string[]): number {
  // 检查是否所有韵母相同（叠韵，不好）
  if (yunmus.length >= 2 && yunmus.every((y) => y === yunmus[0])) {
    return 2; // 叠韵，评分很低
  }

  // 检查是否有重复韵母
  const uniqueYunmus = new Set(yunmus);

  if (uniqueYunmus.size === yunmus.length) {
    // 所有韵母都不同，最佳
    return 10;
  } else if (uniqueYunmus.size === yunmus.length - 1) {
    // 只有一对重复，良好
    return 7;
  } else {
    // 多个重复，一般
    return 5;
  }
}
