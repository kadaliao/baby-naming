/**
 * 诗词生成器 - 基于预处理的诗词片段
 * "Good code has no special cases" - Linus
 */

import type { NameCandidate, Gender } from '@/types/name';
import { getCharWuxing } from '@/lib/utils/data-loader';
import fs from 'fs';
import path from 'path';

type PoetryFragment = {
  chars: string;
  poemId: number;
  poemTitle: string;
  poemAuthor: string;
  excerpt: string;
  position: 'consecutive' | 'single';
};

// 全局缓存（避免每次都读取文件）
let cachedFragments: PoetryFragment[] | null = null;

/**
 * 懒加载诗词片段（仅服务端）
 */
function loadFragments(): PoetryFragment[] {
  if (cachedFragments) {
    return cachedFragments;
  }

  const fragmentsPath = path.join(process.cwd(), 'data/poetry/fragments.json');
  const data = JSON.parse(fs.readFileSync(fragmentsPath, 'utf-8')) as { fragments: PoetryFragment[] };
  cachedFragments = data.fragments;

  return cachedFragments;
}

/**
 * 诗词生成器主函数
 *
 * 从预处理的诗词片段中筛选，无需区分单字/双字/固定字模式
 */
export function generateFromPoetry(
  surname: string,
  gender?: Gender,
  wuxingNeeds?: string[],
  count: number = 20,
  fixedChar?: { char: string; position: 'first' | 'second' }
): NameCandidate[] {
  const fragments = loadFragments();

  // 统一过滤逻辑（无特殊情况）
  const filtered = fragments.filter(fragment => {
    // 固定字模式：只返回真正包含固定字的连续2字片段
    if (fixedChar) {
      // 必须是连续2字片段
      if (fragment.position !== 'consecutive') {
        return false;
      }

      // 必须包含固定字且位置匹配
      const [char1, char2] = fragment.chars;
      if (fixedChar.position === 'first') {
        return char1 === fixedChar.char;
      } else {
        return char2 === fixedChar.char;
      }
    }

    // 五行过滤
    if (wuxingNeeds && wuxingNeeds.length > 0) {
      // 片段中的所有字都需要满足五行要求
      return [...fragment.chars].every(char => {
        const wuxing = getCharWuxing(char);
        return wuxing && wuxingNeeds.includes(wuxing);
      });
    }

    return true;
  });

  // 固定字模式：直接使用片段（已包含固定字）
  if (fixedChar) {
    const candidates = filtered.map(fragment => ({
      fullName: surname + fragment.chars,
      firstName: fragment.chars,
      source: 'poetry' as const,
      sourceDetail: `《${fragment.poemTitle}》${fragment.poemAuthor}：${fragment.excerpt}`,
    }));

    // 随机打乱并返回
    return candidates.sort(() => Math.random() - 0.5).slice(0, count);
  }

  // 正常模式：直接转换
  const candidates = filtered.map(fragment => ({
    fullName: surname + fragment.chars,
    firstName: fragment.chars,
    source: 'poetry' as const,
    sourceDetail: `《${fragment.poemTitle}》${fragment.poemAuthor}：${fragment.excerpt}`,
  }));

  // 随机打乱并返回
  return candidates.sort(() => Math.random() - 0.5).slice(0, count);
}
