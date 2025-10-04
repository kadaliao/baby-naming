const fs = require('fs');
const path = require('path');

// 读取现有数据
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

// 百家姓前30个（按五行分类）
const surnames = [
  // 金
  { char: '赵', wuxing: '金' },
  { char: '钱', wuxing: '金' },
  { char: '孙', wuxing: '金' },
  { char: '周', wuxing: '金' },
  { char: '申', wuxing: '金' },
  { char: '郑', wuxing: '金' },
  { char: '石', wuxing: '金' },
  { char: '沈', wuxing: '金' },
  { char: '谢', wuxing: '金' },

  // 木
  { char: '李', wuxing: '木' },
  { char: '林', wuxing: '木' },
  { char: '杨', wuxing: '木' },
  { char: '朱', wuxing: '木' },
  { char: '吴', wuxing: '木' },
  { char: '许', wuxing: '木' },
  { char: '柳', wuxing: '木' },
  { char: '贾', wuxing: '木' },
  { char: '董', wuxing: '木' },

  // 水
  { char: '王', wuxing: '水' },
  { char: '刘', wuxing: '水' },
  { char: '黄', wuxing: '水' },
  { char: '冯', wuxing: '水' },
  { char: '汤', wuxing: '水' },
  { char: '潘', wuxing: '水' },
  { char: '韩', wuxing: '水' },

  // 火
  { char: '张', wuxing: '火' },
  { char: '陈', wuxing: '火' },
  { char: '郭', wuxing: '火' },
  { char: '何', wuxing: '火' },
  { char: '高', wuxing: '火' },
  { char: '夏', wuxing: '火' },
  { char: '唐', wuxing: '火' },

  // 土
  { char: '吴', wuxing: '土' },
  { char: '徐', wuxing: '土' },
  { char: '马', wuxing: '土' },
  { char: '袁', wuxing: '土' },
  { char: '魏', wuxing: '土' },
  { char: '于', wuxing: '土' },
];

const existingChars = new Set(wuxingData.characters.map(c => c.char));
const newChars = surnames.filter(c => !existingChars.has(c.char));

console.log(`原有字数: ${wuxingData.characters.length}`);
console.log(`新增姓氏: ${newChars.length}`);

wuxingData.characters = [...wuxingData.characters, ...newChars];

fs.writeFileSync(wuxingPath, JSON.stringify(wuxingData, null, 2), 'utf8');

console.log('✅ 姓氏添加完成！');
console.log(`总字数: ${wuxingData.characters.length}`);
