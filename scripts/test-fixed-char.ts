/**
 * 测试固定字功能
 */

import { generateFromPoetry } from '@/lib/generator/poetry';
import { generateFromWuxing } from '@/lib/generator/wuxing';

console.log('========== 测试固定字功能 ==========\n');

// 测试 1: 诗词生成器 - 第一个字固定
console.log('测试 1: 诗词生成器 - 固定字"明"在第一个位置');
const poetry1 = generateFromPoetry(
  '李',
  'male',
  undefined,
  5,
  { char: '明', position: 'first' }
);
console.log(`生成 ${poetry1.length} 个候选：`);
poetry1.slice(0, 3).forEach(c => {
  console.log(`  - ${c.fullName} (${c.firstName})`);
  console.log(`    来源: ${c.sourceDetail?.substring(0, 50)}...`);
});
console.log();

// 测试 2: 诗词生成器 - 第二个字固定
console.log('测试 2: 诗词生成器 - 固定字"国"在第二个位置');
const poetry2 = generateFromPoetry(
  '王',
  'male',
  undefined,
  5,
  { char: '国', position: 'second' }
);
console.log(`生成 ${poetry2.length} 个候选：`);
poetry2.slice(0, 3).forEach(c => {
  console.log(`  - ${c.fullName} (${c.firstName})`);
  console.log(`    来源: ${c.sourceDetail?.substring(0, 50)}...`);
});
console.log();

// 测试 3: 五行生成器 - 固定字模式
console.log('测试 3: 五行生成器 - 固定字"家"在第一个位置，补水');
const wuxing1 = generateFromWuxing(
  '张',
  ['水'],
  'neutral',
  5,
  { char: '家', position: 'first' }
);
console.log(`生成 ${wuxing1.length} 个候选：`);
wuxing1.slice(0, 3).forEach(c => {
  console.log(`  - ${c.fullName} (${c.firstName})`);
  console.log(`    来源: ${c.sourceDetail}`);
});
console.log();

// 测试 4: 五行生成器 - 第二个字固定
console.log('测试 4: 五行生成器 - 固定字"涵"在第二个位置，补木');
const wuxing2 = generateFromWuxing(
  '刘',
  ['木'],
  'female',
  5,
  { char: '涵', position: 'second' }
);
console.log(`生成 ${wuxing2.length} 个候选：`);
wuxing2.slice(0, 3).forEach(c => {
  console.log(`  - ${c.fullName} (${c.firstName})`);
  console.log(`    来源: ${c.sourceDetail}`);
});
console.log();

// 测试 5: 无固定字（验证向后兼容）
console.log('测试 5: 无固定字 - 验证向后兼容');
const normal = generateFromPoetry('赵', 'neutral', undefined, 3);
console.log(`生成 ${normal.length} 个候选（双字名）：`);
normal.forEach(c => {
  console.log(`  - ${c.fullName} (${c.firstName})`);
});
console.log();

console.log('========== 测试完成 ==========');
