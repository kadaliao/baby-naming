/**
 * 测试八字计算功能
 */

import { calculateBazi, formatBazi } from '../lib/bazi/calculator';

function testBazi() {
  console.log('\n=== 测试八字计算 ===\n');

  // 测试用例1: 2024年6月15日 10:30
  const date1 = new Date(2024, 5, 15, 10, 30);
  console.log(`出生日期：${date1.toLocaleString('zh-CN')}`);
  const bazi1 = calculateBazi(date1);
  console.log(formatBazi(bazi1));
  console.log('');

  // 测试用例2: 2023年3月8日 14:00
  const date2 = new Date(2023, 2, 8, 14, 0);
  console.log(`出生日期：${date2.toLocaleString('zh-CN')}`);
  const bazi2 = calculateBazi(date2);
  console.log(formatBazi(bazi2));
  console.log('');

  // 测试用例3: 2025年1月1日 0:00
  const date3 = new Date(2025, 0, 1, 0, 0);
  console.log(`出生日期：${date3.toLocaleString('zh-CN')}`);
  const bazi3 = calculateBazi(date3);
  console.log(formatBazi(bazi3));
  console.log('');

  console.log('✅ 八字计算测试完成！\n');
}

testBazi();
