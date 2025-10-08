/**
 * 测试历史记录去重功能
 */

import { saveName, getHistory, getStats, toggleFavorite, deleteName } from '../lib/db/repository';
import type { SaveNameInput } from '../lib/db/repository';

const testSessionId = 'test-dedup-session';

// 创建测试用的候选名字
function createTestInput(firstName: string, timestamp: Date): SaveNameInput {
  return {
    sessionId: testSessionId,
    surname: '测',
    candidate: {
      fullName: `测${firstName}`,
      firstName: firstName,
      source: 'poetry',
      sourceDetail: '测试诗句',
      chars: firstName.split(''),
    },
    score: {
      total: 85,
      grade: 'A',
      breakdown: {
        wuxing: { score: 20, maxScore: 25, details: [] },
        yinlu: { score: 22, maxScore: 25, details: [] },
        zixing: { score: 18, maxScore: 20, details: [] },
        yuyi: { score: 25, maxScore: 30, details: [] },
      },
    },
  };
}

console.log('🧪 测试历史记录去重功能\n');

// 1. 清理测试数据
console.log('1️⃣ 清理旧测试数据...');
const oldRecords = getHistory({ sessionId: testSessionId });
oldRecords.forEach((r) => deleteName(r.id));
console.log(`   已清理 ${oldRecords.length} 条旧数据\n`);

// 2. 插入重复数据
console.log('2️⃣ 插入测试数据...');
const now = new Date();

// 插入"测试甲" 3次（时间递增）
const id1 = saveName({
  ...createTestInput('试甲', new Date(now.getTime() - 3000)),
});
console.log(`   插入 #${id1}: 测试甲 (最早)`);

const id2 = saveName({
  ...createTestInput('试甲', new Date(now.getTime() - 2000)),
});
console.log(`   插入 #${id2}: 测试甲 (中间)`);

const id3 = saveName({
  ...createTestInput('试甲', new Date(now.getTime() - 1000)),
});
console.log(`   插入 #${id3}: 测试甲 (最晚)`);

// 插入"测试乙" 2次
const id4 = saveName({
  ...createTestInput('试乙', new Date(now.getTime() - 2000)),
});
console.log(`   插入 #${id4}: 测试乙 (最早)`);

const id5 = saveName({
  ...createTestInput('试乙', new Date(now.getTime() - 1000)),
});
console.log(`   插入 #${id5}: 测试乙 (最晚)`);

console.log(`\n   共插入 5 条记录 (2个唯一名字)\n`);

// 3. 验证查询去重
console.log('3️⃣ 验证查询去重...');
const history = getHistory({ sessionId: testSessionId });
console.log(`   查询结果数量: ${history.length} (预期: 2)`);

if (history.length !== 2) {
  console.error('   ❌ 去重失败！应该只返回2条记录');
} else {
  console.log('   ✅ 去重成功');
}

// 验证保留最早记录
const record1 = history.find((r) => r.first_name === '试甲');
if (record1?.id === id1) {
  console.log(`   ✅ 测试甲保留最早记录 (id=${id1})`);
} else {
  console.error(`   ❌ 测试甲应保留id=${id1}，实际=${record1?.id}`);
}

const record2 = history.find((r) => r.first_name === '试乙');
if (record2?.id === id4) {
  console.log(`   ✅ 测试乙保留最早记录 (id=${id4})`);
} else {
  console.error(`   ❌ 测试乙应保留id=${id4}，实际=${record2?.id}`);
}

console.log();

// 4. 验证收藏同步
console.log('4️⃣ 验证收藏同步...');
console.log(`   收藏"测试甲"的最晚记录 (id=${id3})...`);
toggleFavorite(id3);

const historyAfterFav = getHistory({ sessionId: testSessionId });
const record1Fav = historyAfterFav.find((r) => r.first_name === '试甲');

if (record1Fav?.is_favorite === 1) {
  console.log('   ✅ 收藏状态已合并到最早记录');
} else {
  console.error('   ❌ 收藏状态未合并');
}

// 验证收藏筛选
const favorites = getHistory({ sessionId: testSessionId }, { onlyFavorites: true });
if (favorites.length === 1 && favorites[0].first_name === '试甲') {
  console.log(`   ✅ 收藏筛选正确 (${favorites.length}条)`);
} else {
  console.error(`   ❌ 收藏筛选错误，应为1条，实际${favorites.length}条`);
}

console.log();

// 5. 验证统计
console.log('5️⃣ 验证统计信息...');
const stats = getStats({ sessionId: testSessionId });
console.log(`   总数: ${stats.total} (预期: 2)`);
console.log(`   收藏数: ${stats.favorites} (预期: 1)`);
console.log(`   平均分: ${stats.avgScore}`);

if (stats.total === 2 && stats.favorites === 1) {
  console.log('   ✅ 统计数据正确');
} else {
  console.error('   ❌ 统计数据错误');
}

console.log();

// 6. 验证删除同步
console.log('6️⃣ 验证删除同步...');
console.log(`   删除"测试甲"的中间记录 (id=${id2})...`);
deleteName(id2);

const historyAfterDelete = getHistory({ sessionId: testSessionId });
const hasTestA = historyAfterDelete.some((r) => r.first_name === '试甲');

if (!hasTestA && historyAfterDelete.length === 1) {
  console.log('   ✅ 所有"测试甲"记录已删除');
} else {
  console.error('   ❌ 删除同步失败');
}

console.log();

// 7. 清理测试数据
console.log('7️⃣ 清理测试数据...');
const finalRecords = getHistory({ sessionId: testSessionId });
finalRecords.forEach((r) => deleteName(r.id));
console.log(`   已清理 ${finalRecords.length} 条测试数据\n`);

console.log('✅ 所有测试完成！');
