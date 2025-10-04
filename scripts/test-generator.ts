/**
 * 测试生成器功能
 */

import { generateFromPoetry } from '../lib/generator/poetry';
import { generateFromWuxing } from '../lib/generator/wuxing';
import { comprehensiveScore } from '../lib/scoring';

async function testPoetryGenerator() {
  console.log('\n=== 测试诗词生成器 ===\n');

  const candidates = generateFromPoetry('李', 'male', undefined, 10);

  console.log(`生成了 ${candidates.length} 个候选名字：\n`);

  for (const candidate of candidates.slice(0, 5)) {
    const score = await comprehensiveScore(
      candidate.fullName,
      candidate.firstName,
      ['聪明智慧', '品德高尚']
    );

    console.log(`${candidate.fullName}`);
    console.log(`  来源：${candidate.sourceDetail}`);
    console.log(`  评分：${score.total}/100 (${score.grade}级)`);
    console.log(`  五行：${score.breakdown.wuxing.reason}`);
    console.log(`  音律：${score.breakdown.yinlu.reason}`);
    console.log('');
  }
}

async function testWuxingGenerator() {
  console.log('\n=== 测试五行生成器 ===\n');

  const candidates = generateFromWuxing('王', ['水', '木'], 'female', 10);

  console.log(`生成了 ${candidates.length} 个候选名字：\n`);

  for (const candidate of candidates.slice(0, 5)) {
    const score = await comprehensiveScore(
      candidate.fullName,
      candidate.firstName,
      ['聪明智慧', '温柔善良']
    );

    console.log(`${candidate.fullName}`);
    console.log(`  来源：${candidate.sourceDetail}`);
    console.log(`  评分：${score.total}/100 (${score.grade}级)`);
    console.log(`  五行：${score.breakdown.wuxing.reason}`);
    console.log(`  音律：${score.breakdown.yinlu.reason}`);
    console.log('');
  }
}

async function main() {
  await testPoetryGenerator();
  await testWuxingGenerator();

  console.log('✅ 生成器测试完成！\n');
}

main();
