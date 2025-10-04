/**
 * 五行生成器
 * "Simplicity is the ultimate sophistication" - Not Linus, but he'd agree
 */

import type { NameCandidate, Gender } from '@/types/name';
import wuxingData from '@/data/characters/wuxing.json';

/**
 * 获取指定五行的所有字符
 */
function getCharsByWuxing(wuxing: string): string[] {
  return wuxingData.characters
    .filter(c => c.wuxing === wuxing)
    .map(c => c.char);
}

/**
 * 性别过滤（临时简单版本，基于经验规则）
 */
function filterByGender(chars: string[], gender?: Gender): string[] {
  if (!gender || gender === 'neutral') {
    return chars;
  }

  // 简单的性别倾向判断（基于常见字）
  const maleChars = new Set(['浩', '宇', '轩', '博', '杰', '凯', '毅', '阳', '昊', '炎', '鸿', '伟', '勇', '健', '建']);
  const femaleChars = new Set(['婉', '雅', '琳', '颖', '淑', '雯', '洁', '涵', '萱', '筱', '嘉', '佳', '思', '诗', '语', '雪']);

  return chars.filter(char => {
    if (gender === 'male') {
      return !femaleChars.has(char);
    } else {
      return !maleChars.has(char);
    }
  });
}

/**
 * 生成单字名
 */
function generateSingleChar(
  surname: string,
  chars: string[],
  wuxing: string
): NameCandidate[] {
  return chars.map(char => ({
    fullName: surname + char,
    firstName: char,
    source: 'wuxing' as const,
    sourceDetail: `五行补${wuxing}`,
  }));
}

/**
 * 生成双字名（考虑五行相生）
 */
function generateDoubleChar(
  surname: string,
  targetChars: string[],
  targetWuxing: string,
  helperChars: string[],
  helperWuxing: string
): NameCandidate[] {
  const candidates: NameCandidate[] = [];

  // 目标五行 + 生它的五行（最优组合）
  for (const targetChar of targetChars.slice(0, 8)) {
    for (const helperChar of helperChars.slice(0, 8)) {
      candidates.push({
        fullName: surname + targetChar + helperChar,
        firstName: targetChar + helperChar,
        source: 'wuxing' as const,
        sourceDetail: `五行补${targetWuxing}（${helperWuxing}生${targetWuxing}）`,
      });

      candidates.push({
        fullName: surname + helperChar + targetChar,
        firstName: helperChar + targetChar,
        source: 'wuxing' as const,
        sourceDetail: `五行补${targetWuxing}（${helperWuxing}生${targetWuxing}）`,
      });
    }
  }

  // 同五行组合（备选）
  for (let i = 0; i < Math.min(5, targetChars.length); i++) {
    for (let j = i + 1; j < Math.min(5, targetChars.length); j++) {
      const char1 = targetChars[i];
      const char2 = targetChars[j];

      candidates.push({
        fullName: surname + char1 + char2,
        firstName: char1 + char2,
        source: 'wuxing' as const,
        sourceDetail: `五行补${targetWuxing}`,
      });
    }
  }

  return candidates;
}

/**
 * 五行生成器主函数
 */
export function generateFromWuxing(
  surname: string,
  wuxingNeeds: string[],
  gender?: Gender,
  count: number = 20
): NameCandidate[] {
  if (!wuxingNeeds || wuxingNeeds.length === 0) {
    return [];
  }

  // 五行相生关系
  const shengMap: Record<string, string> = {
    '金': '水',
    '水': '木',
    '木': '火',
    '火': '土',
    '土': '金',
  };

  // 反向查找：谁生它
  const shengByMap: Record<string, string> = {
    '水': '金',
    '木': '水',
    '火': '木',
    '土': '火',
    '金': '土',
  };

  const candidates: NameCandidate[] = [];

  // 对每个需要的五行，生成候选
  for (const wuxing of wuxingNeeds) {
    // 1. 获取目标五行的字
    let targetChars = getCharsByWuxing(wuxing);
    targetChars = filterByGender(targetChars, gender);

    // 2. 获取生它的五行的字
    const helperWuxing = shengByMap[wuxing] || '金';
    let helperChars = getCharsByWuxing(helperWuxing);
    helperChars = filterByGender(helperChars, gender);

    if (targetChars.length === 0) continue;

    // 3. 生成候选
    const limit = Math.floor(count / wuxingNeeds.length);

    // 双字名（优先相生组合）
    if (helperChars.length > 0) {
      const doubleChars = generateDoubleChar(
        surname,
        targetChars,
        wuxing,
        helperChars,
        helperWuxing
      );
      candidates.push(...doubleChars.slice(0, limit));
    }

    // 单字名（如果不够）
    if (candidates.length < limit * (wuxingNeeds.indexOf(wuxing) + 1)) {
      const singleChars = generateSingleChar(surname, targetChars.slice(0, 5), wuxing);
      candidates.push(...singleChars);
    }
  }

  // 4. 随机打乱并返回前N个
  return candidates
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
