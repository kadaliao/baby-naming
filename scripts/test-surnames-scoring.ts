/**
 * 测试之前缺失姓氏的评分功能
 */

import { scoreYinlu } from '@/lib/scoring/yinlu';

// 之前缺失的姓氏
const missingSurnames = [
  '罗', '邓', '曹', '彭', '萧', '蔡', '蒋', '余',
  '程', '吕', '姚', '卢', '姜', '崔', '谭', '陆',
  '汪', '范', '廖', '韦', '付', '邹', '熊', '邱'
];

console.log('\n🧪 测试之前缺失姓氏的音律评分\n');
console.log('═'.repeat(60));

let successCount = 0;
let failCount = 0;

for (const surname of missingSurnames) {
  const testName = surname + '诗雅'; // 随便配个名字
  const result = scoreYinlu(testName);

  if (result.reason.includes('缺少拼音数据')) {
    console.log(`❌ ${testName}: ${result.reason}`);
    failCount++;
  } else {
    console.log(`✅ ${testName}: ${result.score}分 - ${result.reason}`);
    successCount++;
  }
}

console.log('═'.repeat(60));
console.log(`\n📊 测试结果: 成功 ${successCount}/${missingSurnames.length}, 失败 ${failCount}`);

if (failCount === 0) {
  console.log('🎉 完美！所有姓氏都能正常评分！');
} else {
  console.log('⚠️  仍有姓氏无法评分，请检查数据库');
}
