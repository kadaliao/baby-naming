/**
 * 测试用户系统
 * 运行: npx tsx scripts/test-user-system.ts
 */

import { registerOrLogin, migrateSessionToUser, getUserById } from '../lib/auth/user';
import { saveName, getHistory, getStats } from '../lib/db/repository';
import type { SaveNameInput } from '../lib/db/repository';

console.log('🧪 测试用户系统\n');

// 测试数据
const testSessionId = 'test-session-' + Date.now();
const testUsername = 'testuser' + Date.now();
const testPassword = 'test1234';

// Mock候选名字数据
const mockCandidate = {
  fullName: '张诗韵',
  firstName: '诗韵',
  source: 'poetry',
  sourceDetail: '出自唐诗《春江花月夜》',
  meaning: '富有诗意的韵律',
};

const mockScore = {
  total: 92,
  grade: 'A',
  breakdown: {
    wuxing: { score: 23, details: '五行平衡' },
    yinlu: { score: 24, details: '音律优美' },
    zixing: { score: 19, details: '字形协调' },
    yuyi: { score: 26, details: '寓意深远' },
  },
};

async function test() {
  try {
    // Step 1: 创建匿名session数据
    console.log('📝 Step 1: 创建匿名session数据');
    const saveInput: SaveNameInput = {
      sessionId: testSessionId,
      surname: '张',
      gender: 'female',
      candidate: mockCandidate,
      score: mockScore,
    };
    const savedId = saveName(saveInput);
    console.log(`  ✓ 保存了1条记录，ID: ${savedId}`);

    // 验证session数据
    const sessionHistory = getHistory({ sessionId: testSessionId });
    console.log(`  ✓ Session历史记录数: ${sessionHistory.length}`);

    // Step 2: 注册新用户
    console.log('\n👤 Step 2: 注册新用户');
    const newUser = await registerOrLogin(testUsername, testPassword);
    if (!newUser) {
      throw new Error('注册失败');
    }
    console.log(`  ✓ 注册成功: ${newUser.username} (ID: ${newUser.id})`);

    // Step 3: 迁移session数据到用户
    console.log('\n🔄 Step 3: 迁移session数据到用户');
    const migratedCount = migrateSessionToUser(testSessionId, newUser.id);
    console.log(`  ✓ 迁移了 ${migratedCount} 条记录`);

    // 验证迁移后的数据
    const userHistory = getHistory({ userId: newUser.id });
    console.log(`  ✓ 用户历史记录数: ${userHistory.length}`);

    // Step 4: 验证登录（相同用户名和密码）
    console.log('\n🔑 Step 4: 验证登录');
    const loginUser = await registerOrLogin(testUsername, testPassword);
    if (!loginUser) {
      throw new Error('登录失败');
    }
    console.log(`  ✓ 登录成功: ${loginUser.username} (ID: ${loginUser.id})`);

    // Step 5: 验证错误密码
    console.log('\n❌ Step 5: 验证错误密码');
    const failedLogin = await registerOrLogin(testUsername, 'wrongpassword');
    if (failedLogin) {
      throw new Error('不应该用错误密码登录成功');
    }
    console.log('  ✓ 错误密码正确被拒绝');

    // Step 6: 获取统计信息
    console.log('\n📊 Step 6: 获取统计信息');
    const stats = getStats({ userId: newUser.id });
    console.log(`  总记录数: ${stats.total}`);
    console.log(`  收藏数: ${stats.favorites}`);
    console.log(`  平均分: ${stats.avgScore}`);
    console.log(`  来源分布:`, stats.bySources);

    console.log('\n✅ 所有测试通过！');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}

test();
