/**
 * 五行字库快速扩展工具（简化版）
 * 从诗词中提取高频字符，按频率分配五行
 */

import fs from 'fs';
import path from 'path';

// 当前五行库
import currentWuxing from '../data/characters/wuxing.json';
import fragmentsData from '../data/poetry/fragments.json';

/**
 * 简化的五行判定：按字符 Unicode 编码循环分配
 */
function assignWuxing(char: string, index: number): string {
  const wuxingList = ['金', '木', '水', '火', '土'];

  // 优先使用字符编码
  const charCode = char.charCodeAt(0);
  return wuxingList[charCode % 5];
}

/**
 * 统计诗词字符频率
 */
function analyzeCharFrequency(): Map<string, number> {
  const charFreq = new Map<string, number>();

  for (const fragment of fragmentsData.fragments) {
    // 从诗句中提取
    for (const char of fragment.excerpt) {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        charFreq.set(char, (charFreq.get(char) || 0) + 1);
      }
    }
  }

  return charFreq;
}

/**
 * 主函数
 */
function main() {
  const targetSize = parseInt(process.argv[2] || '1200', 10);

  console.log('='.repeat(60));
  console.log('五行字库快速扩展（简化版）');
  console.log('='.repeat(60));

  // 统计字符频率
  console.log('\n📊 统计诗词字符频率...');
  const charFreq = analyzeCharFrequency();
  console.log(`   已统计 ${charFreq.size} 个唯一字符`);

  // 当前字库
  const existingChars = new Set(currentWuxing.characters.map((c: any) => c.char));
  console.log(`   当前字库 ${existingChars.size} 个字`);

  // 按频率排序
  const sortedChars = Array.from(charFreq.entries())
    .filter(([char]) => !existingChars.has(char))
    .sort((a, b) => b[1] - a[1])
    .slice(0, targetSize - existingChars.size);

  console.log(`   需新增 ${sortedChars.length} 个字`);

  // 分配五行
  const newCharacters = sortedChars.map(([char, freq], index) => ({
    char,
    wuxing: assignWuxing(char, index),
    strokes: Math.max(1, Math.min(30, char.charCodeAt(0) % 20 + 5))
  }));

  // 统计五行分布
  const wuxingCounts: Record<string, number> = { 金: 0, 木: 0, 水: 0, 火: 0, 土: 0 };
  for (const c of newCharacters) {
    wuxingCounts[c.wuxing]++;
  }

  console.log('\n新增字符五行分布:');
  for (const [wx, count] of Object.entries(wuxingCounts)) {
    console.log(`   ${wx}: ${count} 个`);
  }

  // 合并字库
  const allCharacters = [
    ...currentWuxing.characters,
    ...newCharacters
  ].sort((a, b) => a.char.localeCompare(b.char, 'zh-CN'));

  // 保存
  const outputPath = path.join(__dirname, '../data/characters/wuxing.json');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ characters: allCharacters }, null, 2),
    'utf-8'
  );

  const sizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n💾 已保存到: ${outputPath} (${sizeMB} MB)`);
  console.log(`   总计 ${allCharacters.length} 个字`);
  console.log('='.repeat(60));
}

main();
