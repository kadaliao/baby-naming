/**
 * 探索lunar-javascript API
 */

const { Solar } = require('lunar-javascript');

// 创建一个测试日期
const solar = Solar.fromYmdHms(2024, 6, 15, 10, 30, 0);
const lunar = solar.getLunar();

console.log('=== Solar 对象方法 ===');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(solar)).filter(m => !m.startsWith('_')).sort());

console.log('\n=== Lunar 对象方法 ===');
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(lunar)).filter(m => !m.startsWith('_')).sort());

console.log('\n=== 获取八字相关信息 ===');
console.log('Year in GanZhi:', lunar.getYearInGanZhi());
console.log('Month in GanZhi:', lunar.getMonthInGanZhi());
console.log('Day in GanZhi:', lunar.getDayInGanZhi());
console.log('Time in GanZhi:', lunar.getTimeInGanZhi());

console.log('\n=== 获取五行 ===');
console.log('Year WuXing:', lunar.getYearWuXing());
console.log('Month WuXing:', lunar.getMonthWuXing());
console.log('Day WuXing:', lunar.getDayWuXing());
console.log('Time WuXing:', lunar.getTimeWuXing());

console.log('\n=== 完整信息 ===');
console.log(lunar.toFullString());
