const fs = require('fs');
const path = require('path');

// 读取现有数据
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

// 补充常用起名字（按五行分类）
const additionalChars = [
  // 金 - 理性、坚定、锐利相关
  { char: '思', wuxing: '金' },
  { char: '新', wuxing: '金' },
  { char: '心', wuxing: '金' },
  { char: '信', wuxing: '金' },
  { char: '正', wuxing: '金' },
  { char: '铁', wuxing: '金' },
  { char: '钰', wuxing: '金' },
  { char: '锐', wuxing: '金' },
  { char: '睿', wuxing: '金' },
  { char: '诚', wuxing: '金' },
  { char: '静', wuxing: '金' },
  { char: '宣', wuxing: '金' },
  { char: '宸', wuxing: '金' },
  { char: '铭', wuxing: '金' },
  { char: '鑫', wuxing: '金' },
  { char: '舒', wuxing: '金' },
  { char: '书', wuxing: '金' },
  { char: '诗', wuxing: '金' },
  { char: '钧', wuxing: '金' },
  { char: '修', wuxing: '金' },

  // 木 - 生长、仁慈、柔和相关
  { char: '嘉', wuxing: '木' },
  { char: '佳', wuxing: '木' },
  { char: '家', wuxing: '木' },
  { char: '建', wuxing: '木' },
  { char: '健', wuxing: '木' },
  { char: '杰', wuxing: '木' },
  { char: '凯', wuxing: '木' },
  { char: '可', wuxing: '木' },
  { char: '毅', wuxing: '木' },
  { char: '义', wuxing: '木' },
  { char: '奕', wuxing: '木' },
  { char: '逸', wuxing: '木' },
  { char: '颖', wuxing: '木' },
  { char: '语', wuxing: '木' },
  { char: '雅', wuxing: '木' },
  { char: '轩', wuxing: '木' },
  { char: '筱', wuxing: '木' },
  { char: '琳', wuxing: '木' },
  { char: '雨', wuxing: '木' },
  { char: '羽', wuxing: '木' },

  // 水 - 智慧、流动、灵活相关
  { char: '博', wuxing: '水' },
  { char: '渤', wuxing: '水' },
  { char: '淑', wuxing: '水' },
  { char: '雯', wuxing: '水' },
  { char: '文', wuxing: '水' },
  { char: '敏', wuxing: '水' },
  { char: '民', wuxing: '水' },
  { char: '溪', wuxing: '水' },
  { char: '洋', wuxing: '水' },
  { char: '洁', wuxing: '水' },
  { char: '鸿', wuxing: '水' },
  { char: '宏', wuxing: '水' },
  { char: '泓', wuxing: '水' },
  { char: '涛', wuxing: '水' },
  { char: '澜', wuxing: '水' },
  { char: '浩', wuxing: '水' },
  { char: '泽', wuxing: '水' },
  { char: '潇', wuxing: '水' },
  { char: '霖', wuxing: '水' },
  { char: '雪', wuxing: '水' },

  // 火 - 热情、光明、向上相关
  { char: '乐', wuxing: '火' },
  { char: '朗', wuxing: '火' },
  { char: '亮', wuxing: '火' },
  { char: '良', wuxing: '火' },
  { char: '令', wuxing: '火' },
  { char: '宁', wuxing: '火' },
  { char: '诺', wuxing: '火' },
  { char: '晗', wuxing: '火' },
  { char: '烁', wuxing: '火' },
  { char: '炫', wuxing: '火' },
  { char: '昕', wuxing: '火' },
  { char: '昊', wuxing: '火' },
  { char: '暄', wuxing: '火' },
  { char: '阳', wuxing: '火' },
  { char: '扬', wuxing: '火' },
  { char: '炎', wuxing: '火' },
  { char: '煜', wuxing: '火' },
  { char: '焱', wuxing: '火' },
  { char: '灿', wuxing: '火' },
  { char: '璐', wuxing: '火' },

  // 土 - 稳重、包容、诚信相关
  { char: '安', wuxing: '土' },
  { char: '伟', wuxing: '土' },
  { char: '维', wuxing: '土' },
  { char: '为', wuxing: '土' },
  { char: '唯', wuxing: '土' },
  { char: '勇', wuxing: '土' },
  { char: '永', wuxing: '土' },
  { char: '咏', wuxing: '土' },
  { char: '宇', wuxing: '土' },
  { char: '羽', wuxing: '土' },
  { char: '远', wuxing: '土' },
  { char: '源', wuxing: '土' },
  { char: '跃', wuxing: '土' },
  { char: '越', wuxing: '土' },
  { char: '岩', wuxing: '土' },
  { char: '宛', wuxing: '土' },
  { char: '婉', wuxing: '土' },
  { char: '玥', wuxing: '土' },
  { char: '轩', wuxing: '土' },
  { char: '然', wuxing: '土' },
];

// 去重：检查是否已存在
const existingChars = new Set(wuxingData.characters.map(c => c.char));
const newChars = additionalChars.filter(c => !existingChars.has(c.char));

console.log(`原有字数: ${wuxingData.characters.length}`);
console.log(`新增字数: ${newChars.length}`);
console.log(`总字数: ${wuxingData.characters.length + newChars.length}`);

// 合并数据
wuxingData.characters = [...wuxingData.characters, ...newChars];

// 写回文件
fs.writeFileSync(wuxingPath, JSON.stringify(wuxingData, null, 2), 'utf8');

console.log('✅ 五行库扩展完成！');
console.log(`\n新增的字: ${newChars.map(c => c.char).join('、')}`);
