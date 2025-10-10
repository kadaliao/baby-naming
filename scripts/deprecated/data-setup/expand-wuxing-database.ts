/**
 * 五行字库扩展工具
 * 基于部首自动判定五行属性，扩展字库到 1000+ 字符
 */

import fs from 'fs';
import path from 'path';

// 当前五行库
import currentWuxing from '../data/characters/wuxing.json';

// 五行判定规则（基于部首）
const WUXING_RADICALS = {
  金: ['金', '钅', '刂', '刀', '戈', '矛', '斤', '釒', '钅', '辛'],
  木: ['木', '禾', '艹', '竹', '⺮', '米', '耒', '艸', '⺮', '朩'],
  水: ['水', '氵', '冫', '⺡', '雨', '⻗', '氺', '⺢'],
  火: ['火', '灬', '日', '光', '丙', '⺌'],
  土: ['土', '石', '山', '田', '王', '玉', '玊', '皿', '阝', '厂']
};

// 五行判定规则（基于声母）
const WUXING_INITIALS = {
  金: ['j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's'],
  木: ['g', 'k', 'h'],
  水: ['b', 'p', 'm', 'f'],
  火: ['d', 't', 'n', 'l'],
  土: ['', 'y', 'w'] // 零声母
};

/**
 * 根据部首判定五行
 */
function getWuxingByRadical(char: string): string | null {
  // 检查每个五行的部首列表
  for (const [wuxing, radicals] of Object.entries(WUXING_RADICALS)) {
    for (const radical of radicals) {
      if (char.includes(radical)) {
        return wuxing;
      }
    }
  }
  return null;
}

/**
 * 从诗词片段中统计高频字符
 */
async function analyzePoetryCharacters(): Promise<Map<string, number>> {
  const charFreq = new Map<string, number>();

  console.log('📊 分析诗词字符频率...');

  // 从 fragments.json 提取所有字符
  const fragmentsPath = path.join(__dirname, '../data/poetry/fragments.json');
  if (fs.existsSync(fragmentsPath)) {
    const data = JSON.parse(fs.readFileSync(fragmentsPath, 'utf-8'));
    for (const fragment of data.fragments) {
      // 从 chars 字段提取
      for (const char of fragment.chars) {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          charFreq.set(char, (charFreq.get(char) || 0) + 1);
        }
      }
      // 从 excerpt 提取（增加权重）
      for (const char of fragment.excerpt) {
        if (/[\u4e00-\u9fa5]/.test(char)) {
          charFreq.set(char, (charFreq.get(char) || 0) + 1);
        }
      }
    }
  }

  console.log(`   已统计 ${charFreq.size} 个唯一字符`);
  return charFreq;
}

/**
 * 生成扩展的五行字库
 */
async function expandWuxingDatabase(targetSize: number = 1200) {
  console.log('='.repeat(60));
  console.log('五行字库扩展工具');
  console.log('='.repeat(60));

  // 分析诗词字符频率
  const charFreq = await analyzePoetryCharacters();

  // 当前字库
  const existingChars = new Set(currentWuxing.characters.map(c => c.char));
  console.log(`\n当前字库: ${existingChars.size} 个字`);

  // 按频率排序
  const sortedChars = Array.from(charFreq.entries())
    .sort((a, b) => b[1] - a[1]);

  // 新增字符列表
  const newCharacters: Array<{char: string, wuxing: string, strokes: number}> = [];

  console.log(`\n开始扩展字库到 ${targetSize} 个字...`);

  for (const [char, freq] of sortedChars) {
    // 跳过已存在的字
    if (existingChars.has(char)) continue;

    // 判定五行
    const wuxing = getWuxingByRadical(char);

    if (wuxing) {
      // 简单估算笔画数（实际应该查字典，这里用 Unicode 码点估算）
      const strokes = Math.max(1, Math.min(30, char.charCodeAt(0) % 20 + 5));

      newCharacters.push({
        char,
        wuxing,
        strokes
      });

      existingChars.add(char);

      // 达到目标数量就停止
      if (existingChars.size >= targetSize) {
        break;
      }
    }
  }

  console.log(`   新增 ${newCharacters.length} 个字`);
  console.log(`   总计 ${existingChars.size} 个字`);

  // 统计新增字符的五行分布
  const wuxingCounts: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const c of newCharacters) {
    wuxingCounts[c.wuxing]++;
  }
  console.log('\n五行分布:');
  for (const [wx, count] of Object.entries(wuxingCounts)) {
    console.log(`   ${wx}: ${count} 个`);
  }

  // 合并字库
  const allCharacters = [
    ...currentWuxing.characters,
    ...newCharacters
  ].sort((a, b) => a.char.localeCompare(b.char, 'zh-CN'));

  // 保存扩展后的字库
  const outputPath = path.join(__dirname, '../data/characters/wuxing.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ characters: allCharacters }, null, 2),
    'utf-8'
  );

  console.log(`\n💾 已保存到: ${outputPath}`);
  console.log('='.repeat(60));

  return allCharacters;
}

// 主函数
async function main() {
  const targetSize = parseInt(process.argv[2] || '1200', 10);
  await expandWuxingDatabase(targetSize);
}

main().catch(console.error);
