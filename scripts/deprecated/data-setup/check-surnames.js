const fs = require('fs');
const path = require('path');

// 读取拼音数据
const pinyinPath = path.join(__dirname, '../data/characters/pinyin.json');
const pinyinData = JSON.parse(fs.readFileSync(pinyinPath, 'utf8'));

// 创建字符集合
const chars = new Set(pinyinData.characters.map(item => item.char));

// 常见百家姓（前100个）
const commonSurnames = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '萧', '田', '董', '潘', '袁', '蔡', '蒋', '余',
  '于', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
  '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金',
  '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟',
  '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯',
  '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵',
  '万', '钱', '严', '覃', '武', '戴', '莫', '孔', '向', '汤'
];

const missing = commonSurnames.filter(s => !chars.has(s));

console.log(`\n📊 百家姓覆盖检查:`);
console.log(`  常见姓氏总数: ${commonSurnames.length}`);
console.log(`  数据库已覆盖: ${commonSurnames.length - missing.length}`);
console.log(`  缺失姓氏数量: ${missing.length}`);

if (missing.length > 0) {
  console.log(`\n❌ 缺失的姓氏: ${missing.join(', ')}`);
} else {
  console.log(`\n✅ 所有常见姓氏都已覆盖！`);
}
