/**
 * 诗词数据库构建工具
 * 从 chinese-poetry 项目批量下载并预处理全唐诗、宋词、诗经等数据
 * "Good code has no special cases" - Linus
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { getCharWuxing } from '../lib/utils/data-loader';

type PoetryFragment = {
  chars: string;
  poemId: number;
  poemTitle: string;
  poemAuthor: string;
  excerpt: string;
  position: 'consecutive' | 'single';
};

// GitHub 原始文件 URL 前缀
const GITHUB_RAW = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master';

// 数据源配置
const DATA_SOURCES = {
  tang: {
    name: '全唐诗',
    files: Array.from({ length: 58 }, (_, i) => `全唐诗/poet.tang.${i * 1000}.json`),
    parse: (data: any) => data.map((p: any) => ({
      id: p.id || '',
      title: p.title || '无题',
      author: p.author || '佚名',
      content: p.paragraphs.join('')
    }))
  },
  'tang-sample': {
    name: '全唐诗（样本）',
    files: Array.from({ length: 5 }, (_, i) => `全唐诗/poet.tang.${i * 1000}.json`),
    parse: (data: any) => data.map((p: any) => ({
      id: p.id || '',
      title: p.title || '无题',
      author: p.author || '佚名',
      content: p.paragraphs.join('')
    }))
  },
  song: {
    name: '宋词',
    files: Array.from({ length: 21 }, (_, i) => `宋词/ci.song.${i * 1000}.json`),
    parse: (data: any) => data.map((p: any) => ({
      id: p.id || '',
      title: p.rhythmic || '无题',
      author: p.author || '佚名',
      content: p.paragraphs.join('')
    }))
  },
  shijing: {
    name: '诗经',
    files: ['诗经/shijing.json'],
    parse: (data: any) => data.map((p: any, i: number) => ({
      id: `shijing-${i}`,
      title: p.title || '无题',
      author: '诗经',
      content: p.content.join('')
    }))
  }
};

/**
 * 下载文件
 */
function downloadFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * 从诗句中提取片段
 */
function extractFragments(
  sentence: string,
  poemId: string,
  poemTitle: string,
  poemAuthor: string
): PoetryFragment[] {
  const fragments: PoetryFragment[] = [];
  const cleaned = sentence.replace(/[，。！？、；：""''《》（）\s]/g, '');

  if (cleaned.length === 0) return fragments;

  // 连续2字
  for (let i = 0; i < cleaned.length - 1; i++) {
    const char1 = cleaned[i];
    const char2 = cleaned[i + 1];

    if (getCharWuxing(char1) && getCharWuxing(char2)) {
      fragments.push({
        chars: char1 + char2,
        poemId: poemId.hashCode(),
        poemTitle,
        poemAuthor,
        excerpt: sentence,
        position: 'consecutive'
      });
    }
  }

  // 单字
  for (const char of cleaned) {
    if (getCharWuxing(char)) {
      fragments.push({
        chars: char,
        poemId: poemId.hashCode(),
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
 * 处理一首诗
 */
function processPoem(poem: any): PoetryFragment[] {
  const allFragments: PoetryFragment[] = [];
  const sentences = poem.content.split(/[，。！？；]/);

  for (const sentence of sentences) {
    if (!sentence.trim()) continue;
    const fragments = extractFragments(sentence, poem.id, poem.title, poem.author);
    allFragments.push(...fragments);
  }

  return allFragments;
}

/**
 * 去重
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
async function main() {
  const sources = process.argv[2]?.split(',') || ['tang', 'song', 'shijing'];

  console.log('='.repeat(60));
  console.log('诗词数据库构建工具');
  console.log('='.repeat(60));
  console.log(`数据源: ${sources.map(s => DATA_SOURCES[s as keyof typeof DATA_SOURCES].name).join(', ')}\n`);

  let allFragments: PoetryFragment[] = [];
  let totalPoems = 0;

  for (const sourceKey of sources) {
    const source = DATA_SOURCES[sourceKey as keyof typeof DATA_SOURCES];
    if (!source) {
      console.error(`❌ 未知数据源: ${sourceKey}`);
      continue;
    }

    console.log(`\n📚 处理 ${source.name}...`);
    console.log(`   文件数: ${source.files.length}`);

    for (let i = 0; i < source.files.length; i++) {
      const file = source.files[i];
      const url = `${GITHUB_RAW}/${encodeURIComponent(file)}`;

      try {
        process.stdout.write(`   [${i + 1}/${source.files.length}] ${file}...`);

        const content = await downloadFile(url);
        const data = JSON.parse(content);
        const poems = source.parse(data);

        for (const poem of poems) {
          const fragments = processPoem(poem);
          allFragments.push(...fragments);
        }

        totalPoems += poems.length;
        console.log(` ✓ (${poems.length} 首)`);
      } catch (error) {
        console.log(` ✗`);
        console.error(`   错误: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ 下载完成`);
  console.log(`   总诗词数: ${totalPoems}`);
  console.log(`   原始片段: ${allFragments.length}`);

  // 去重
  const uniqueFragments = deduplicate(allFragments);
  console.log(`   去重后: ${uniqueFragments.length}`);

  const consecutive = uniqueFragments.filter(f => f.position === 'consecutive').length;
  const single = uniqueFragments.filter(f => f.position === 'single').length;
  console.log(`   - 连续2字: ${consecutive}`);
  console.log(`   - 单字: ${single}`);

  // 保存
  const outputPath = path.join(__dirname, '../data/poetry/fragments.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ fragments: uniqueFragments }, null, 2),
    'utf-8'
  );

  const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n💾 已保存到: ${outputPath} (${sizeMB} MB)`);
  console.log('='.repeat(60));
}

// Helper: string hash code
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

declare global {
  interface String {
    hashCode(): number;
  }
}

main().catch(console.error);
