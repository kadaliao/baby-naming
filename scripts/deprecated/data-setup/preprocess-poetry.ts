/**
 * 诗词预处理：从诗中提取真实的名字片段
 * "Good code has no special cases" - Linus
 */

import fs from 'fs';
import path from 'path';
import { getCharWuxing } from '../lib/utils/data-loader';

// 导入诗词数据
import poemsData from '../data/poetry/tangshi.json';

type PoetryFragment = {
  chars: string;           // 名字片段: "明月" or "月"
  poemId: number;          // 诗的ID
  poemTitle: string;       // 诗的标题
  poemAuthor: string;      // 作者
  excerpt: string;         // 诗句片段（包含这些字的句子）
  position: 'consecutive' | 'single'; // consecutive=连续2字, single=单字
};

/**
 * 从诗句中提取片段
 */
function extractFragments(
  sentence: string,
  poemId: number,
  poemTitle: string,
  poemAuthor: string
): PoetryFragment[] {
  const fragments: PoetryFragment[] = [];

  // 去除标点符号
  const cleaned = sentence.replace(/[，。！？、；：""''《》（）\s]/g, '');

  if (cleaned.length === 0) return fragments;

  // 1. 提取连续2字组合
  for (let i = 0; i < cleaned.length - 1; i++) {
    const char1 = cleaned[i];
    const char2 = cleaned[i + 1];

    // 两个字都必须在五行库中
    if (getCharWuxing(char1) && getCharWuxing(char2)) {
      fragments.push({
        chars: char1 + char2,
        poemId,
        poemTitle,
        poemAuthor,
        excerpt: sentence,
        position: 'consecutive'
      });
    }
  }

  // 2. 提取单字（用于单字名）
  for (const char of cleaned) {
    if (getCharWuxing(char)) {
      fragments.push({
        chars: char,
        poemId,
        poemTitle,
        poemAuthor,
        excerpt: sentence,
        position: 'single'
      });
    }
  }

  return fragments;
}

/**
 * 处理所有诗词
 */
function processAllPoems(): PoetryFragment[] {
  const allFragments: PoetryFragment[] = [];

  for (const poem of poemsData.poems) {
    // 按标点分句
    const sentences = poem.content.split(/[，。！？；]/);

    for (const sentence of sentences) {
      if (!sentence.trim()) continue;

      const fragments = extractFragments(
        sentence,
        poem.id,
        poem.title,
        poem.author
      );

      allFragments.push(...fragments);
    }
  }

  return allFragments;
}

/**
 * 去重（同一片段可能出现在多首诗中，保留第一次出现）
 */
function deduplicate(fragments: PoetryFragment[]): PoetryFragment[] {
  const seen = new Map<string, PoetryFragment>();

  for (const fragment of fragments) {
    const key = `${fragment.chars}-${fragment.position}`;

    if (!seen.has(key)) {
      seen.set(key, fragment);
    }
  }

  return Array.from(seen.values());
}

/**
 * 主函数
 */
function main() {
  console.log('开始预处理诗词...');
  console.log(`共 ${poemsData.poems.length} 首诗`);

  // 提取所有片段
  const allFragments = processAllPoems();
  console.log(`提取到 ${allFragments.length} 个原始片段`);

  // 去重
  const uniqueFragments = deduplicate(allFragments);
  console.log(`去重后 ${uniqueFragments.length} 个唯一片段`);

  // 统计
  const consecutive = uniqueFragments.filter(f => f.position === 'consecutive').length;
  const single = uniqueFragments.filter(f => f.position === 'single').length;
  console.log(`  - 连续2字: ${consecutive}`);
  console.log(`  - 单字: ${single}`);

  // 保存
  const outputPath = path.join(__dirname, '../data/poetry/fragments.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ fragments: uniqueFragments }, null, 2),
    'utf-8'
  );

  console.log(`\n已保存到: ${outputPath}`);
}

main();
