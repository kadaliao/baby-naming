/**
 * 诗词生成器
 * "Good code has no special cases" - Linus
 */

import type { NameCandidate, Gender } from '@/types/name';
import { getCharWuxing, getPoemsContainingChar } from '@/lib/utils/data-loader';

// 加载诗词数据
import poemsData from '@/data/poetry/tangshi.json';

/**
 * 从诗词中提取适合做名字的字
 */
function extractNamingChars(): string[] {
  const chars = new Set<string>();

  for (const poem of poemsData.poems) {
    // 移除标点符号
    const cleanContent = poem.content.replace(/[，。！？、；：""''《》（）\s]/g, '');

    for (const char of cleanContent) {
      // 只要在五行库中的字，就是可用字
      if (getCharWuxing(char)) {
        chars.add(char);
      }
    }
  }

  return Array.from(chars);
}

/**
 * 过滤字符：性别、五行
 */
function filterChars(
  chars: string[],
  gender?: Gender,
  wuxingNeeds?: string[]
): string[] {
  return chars.filter(char => {
    // 五行过滤
    if (wuxingNeeds && wuxingNeeds.length > 0) {
      const wuxing = getCharWuxing(char);
      if (!wuxing || !wuxingNeeds.includes(wuxing)) {
        return false;
      }
    }

    // TODO: 性别过滤（需要性别数据）

    return true;
  });
}

/**
 * 生成名字候选项（单字名）
 */
function generateSingleChar(
  surname: string,
  chars: string[]
): NameCandidate[] {
  return chars.map(char => {
    const poems = getPoemsContainingChar(char);
    const poem = poems[0]; // 取第一首诗作为来源

    return {
      fullName: surname + char,
      firstName: char,
      source: 'poetry' as const,
      sourceDetail: poem
        ? `《${poem.title}》${poem.author}：${poem.content}`
        : '诗词典故',
    };
  });
}

/**
 * 生成名字候选项（双字名）
 */
function generateDoubleChar(
  surname: string,
  chars: string[]
): NameCandidate[] {
  const candidates: NameCandidate[] = [];

  // 两两组合
  for (let i = 0; i < chars.length; i++) {
    for (let j = i + 1; j < chars.length; j++) {
      const char1 = chars[i];
      const char2 = chars[j];

      // 尝试两种顺序
      const firstName1 = char1 + char2;
      const firstName2 = char2 + char1;

      // 查找来源诗句
      const poems1 = getPoemsContainingChar(char1);
      const poems2 = getPoemsContainingChar(char2);

      // 如果两个字来自同一首诗，优先使用
      const sharedPoem = poems1.find(p1 =>
        poems2.some(p2 => p2.id === p1.id)
      );

      const sourcePoem = sharedPoem || poems1[0] || poems2[0];

      candidates.push({
        fullName: surname + firstName1,
        firstName: firstName1,
        source: 'poetry' as const,
        sourceDetail: sourcePoem
          ? `《${sourcePoem.title}》${sourcePoem.author}：${sourcePoem.content}`
          : '诗词典故',
      });

      candidates.push({
        fullName: surname + firstName2,
        firstName: firstName2,
        source: 'poetry' as const,
        sourceDetail: sourcePoem
          ? `《${sourcePoem.title}》${sourcePoem.author}：${sourcePoem.content}`
          : '诗词典故',
      });
    }
  }

  return candidates;
}

/**
 * 诗词生成器主函数
 */
export function generateFromPoetry(
  surname: string,
  gender?: Gender,
  wuxingNeeds?: string[],
  count: number = 20
): NameCandidate[] {
  // 1. 提取所有可用字
  const allChars = extractNamingChars();

  // 2. 过滤
  const filteredChars = filterChars(allChars, gender, wuxingNeeds);

  if (filteredChars.length === 0) {
    return [];
  }

  // 3. 生成候选（双字名优先）
  const candidates: NameCandidate[] = [];

  // 双字名
  candidates.push(...generateDoubleChar(surname, filteredChars));

  // 单字名（如果双字名不够）
  if (candidates.length < count) {
    candidates.push(...generateSingleChar(surname, filteredChars));
  }

  // 4. 随机打乱并返回前N个
  return candidates
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
