/**
 * 测试新评分系统
 */

import { comprehensiveScore } from '../lib/scoring';

async function testScoring() {
  const testCases = [
    { surname: '李', firstName: '思源', preferences: ['聪明智慧', '文雅诗意'] },
    { surname: '王', firstName: '梓涵', preferences: ['文雅诗意'] },
    { surname: '张', firstName: '浩然', preferences: ['勇敢坚强'] },
    { surname: '刘', firstName: '诗涵', preferences: ['文雅诗意', '聪明智慧'] },
  ];

  console.log('📊 测试新评分系统\n');
  console.log('='.repeat(80));

  for (const { surname, firstName, preferences } of testCases) {
    const fullName = surname + firstName;
    console.log(`\n测试名字: ${fullName}`);
    console.log(`偏好: ${preferences.join('、')}`);
    console.log('-'.repeat(80));

    const result = await comprehensiveScore(fullName, firstName, preferences);

    console.log(`\n总分: ${result.total}/100 (等级: ${result.grade})`);
    console.log(`\n各项评分:`);
    console.log(`  五行: ${result.breakdown.wuxing.score}/25 - ${result.breakdown.wuxing.reason}`);
    console.log(`  音律: ${result.breakdown.yinlu.score}/25 - ${result.breakdown.yinlu.reason}`);
    console.log(`  字形: ${result.breakdown.zixing.score}/20 - ${result.breakdown.zixing.reason}`);
    console.log(`  寓意: ${result.breakdown.yuyi.score}/30 - ${result.breakdown.yuyi.reason}`);

    if (result.suggestions.length > 0) {
      console.log(`\n建议:`);
      result.suggestions.forEach((s) => console.log(`  • ${s}`));
    }

    console.log('\n' + '='.repeat(80));
  }
}

testScoring().catch(console.error);
