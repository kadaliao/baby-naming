/**
 * 测试数据库功能
 */

import { getDatabase, closeDatabase, resetDatabase } from '../lib/db/client';
import {
  saveName,
  getHistory,
  toggleFavorite,
  addNote,
  getStats,
} from '../lib/db/repository';
import type { SaveNameInput } from '../lib/db/repository';

console.log('=== 测试数据库功能 ===\n');

// 1. 初始化数据库
console.log('1. 初始化数据库...');
const db = getDatabase();
resetDatabase(); // 清空数据
console.log('   ✅ 数据库已初始化\n');

// 2. 插入测试数据
console.log('2. 插入测试数据...');
const sessionId = 'test-session-' + Date.now();

const testData: SaveNameInput[] = [
  {
    sessionId,
    surname: '李',
    gender: 'male',
    preferences: ['聪明智慧', '健康平安'],
    sources: ['poetry'],
    candidate: {
      fullName: '李思源',
      firstName: '思源',
      source: 'poetry',
      sourceDetail: '取自《登鹳雀楼》：欲穷千里目，更上一层楼',
    },
    score: {
      total: 85,
      breakdown: {
        wuxing: { score: 20, reason: '五行平衡' },
        yinlu: { score: 22, reason: '音律和谐' },
        zixing: { score: 18, reason: '字形优美' },
        yuyi: { score: 25, reason: '寓意深刻' },
      },
      grade: 'A',
    },
  },
  {
    sessionId,
    surname: '李',
    gender: 'male',
    preferences: ['聪明智慧'],
    sources: ['wuxing'],
    candidate: {
      fullName: '李浩然',
      firstName: '浩然',
      source: 'wuxing',
      sourceDetail: '五行补水',
    },
    score: {
      total: 78,
      breakdown: {
        wuxing: { score: 22, reason: '五行补益' },
        yinlu: { score: 20, reason: '音律良好' },
        zixing: { score: 16, reason: '字形协调' },
        yuyi: { score: 20, reason: '寓意美好' },
      },
      grade: 'B',
    },
  },
];

const ids = testData.map((data) => saveName(data));
console.log(`   ✅ 已插入 ${ids.length} 条记录: [${ids.join(', ')}]\n`);

// 3. 查询历史记录
console.log('3. 查询历史记录...');
const history = getHistory(sessionId);
console.log(`   ✅ 找到 ${history.length} 条记录:`);
history.forEach((record) => {
  console.log(`      - ${record.full_name} (${record.score_total}分, ${record.grade}级)`);
});
console.log();

// 4. 切换收藏
console.log('4. 测试收藏功能...');
const firstId = ids[0];
toggleFavorite(firstId);
console.log(`   ✅ 已收藏 ID=${firstId}`);

const favorites = getHistory(sessionId, { onlyFavorites: true });
console.log(`   ✅ 收藏夹中有 ${favorites.length} 条记录\n`);

// 5. 添加备注
console.log('5. 测试备注功能...');
addNote(firstId, '这个名字很不错，考虑使用');
const updated = getHistory(sessionId).find((r) => r.id === firstId);
console.log(`   ✅ 备注: ${updated?.notes}\n`);

// 6. 统计信息
console.log('6. 查询统计信息...');
const stats = getStats(sessionId);
console.log(`   ✅ 统计:`);
console.log(`      总数: ${stats.total}`);
console.log(`      收藏: ${stats.favorites}`);
console.log(`      平均分: ${stats.avgScore}`);
console.log(`      来源分布:`, stats.bySources);
console.log();

// 7. 清理
console.log('7. 清理测试数据...');
closeDatabase();
console.log('   ✅ 数据库已关闭\n');

console.log('=== 测试完成 ===');
