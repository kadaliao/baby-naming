const fs = require('fs');
const path = require('path');

// 读取数据
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const pinyinPath = path.join(__dirname, '../data/characters/pinyin.json');

const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));
const pinyinData = JSON.parse(fs.readFileSync(pinyinPath, 'utf8'));

// 创建拼音字符集合
const pinyinChars = new Set(pinyinData.characters.map(item => item.char));

// 找出缺失的字符
const missingChars = [];
for (const item of wuxingData.characters) {
  if (!pinyinChars.has(item.char)) {
    missingChars.push({
      char: item.char,
      wuxing: item.wuxing,
      strokes: item.strokes
    });
  }
}

console.log(`\n📊 数据统计:`);
console.log(`  五行库字符总数: ${wuxingData.characters.length}`);
console.log(`  拼音库字符总数: ${pinyinData.characters.length}`);
console.log(`  缺失拼音字符数: ${missingChars.length}`);

if (missingChars.length > 0) {
  console.log(`\n❌ 缺失拼音的字符:`);
  console.log(JSON.stringify(missingChars, null, 2));

  console.log(`\n缺失字符列表: ${missingChars.map(c => c.char).join(', ')}`);
}
