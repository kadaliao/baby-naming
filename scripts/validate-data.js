/**
 * 数据完整性验证脚本
 */

const fs = require('fs');
const path = require('path');

// 读取数据文件
const wuxingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/characters/wuxing.json'), 'utf8')
);
const strokesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/characters/strokes.json'), 'utf8')
);
const pinyinData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/characters/pinyin.json'), 'utf8')
);
const tangshiData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/poetry/tangshi.json'), 'utf8')
);

console.log('📊 数据完整性验证\n');
console.log('='.repeat(50));

// 1. 统计数据量
console.log('\n1️⃣  数据量统计:');
console.log(`   五行库: ${wuxingData.characters.length} 个字`);
console.log(`   笔画库: ${strokesData.characters.length} 个字`);
console.log(`   拼音库: ${pinyinData.characters.length} 个字`);
console.log(`   唐诗库: ${tangshiData.poems.length} 首`);

// 2. 数据一致性检查
console.log('\n2️⃣  数据一致性检查:');

const wuxingChars = new Set(wuxingData.characters.map(c => c.char));
const strokesChars = new Set(strokesData.characters.map(c => c.char));
const pinyinChars = new Set(pinyinData.characters.map(c => c.char));

// 检查五行库的字是否都有笔画数据
const missingStrokes = [];
for (const char of wuxingChars) {
  if (!strokesChars.has(char)) {
    missingStrokes.push(char);
  }
}

// 检查五行库的字是否都有拼音数据
const missingPinyin = [];
for (const char of wuxingChars) {
  if (!pinyinChars.has(char)) {
    missingPinyin.push(char);
  }
}

if (missingStrokes.length === 0 && missingPinyin.length === 0) {
  console.log('   ✅ 数据一致性良好！所有五行库的字都有笔画和拼音数据');
} else {
  if (missingStrokes.length > 0) {
    console.log(`   ⚠️  缺少笔画数据的字 (${missingStrokes.length}个): ${missingStrokes.slice(0, 10).join(', ')}...`);
  }
  if (missingPinyin.length > 0) {
    console.log(`   ⚠️  缺少拼音数据的字 (${missingPinyin.length}个): ${missingPinyin.slice(0, 10).join(', ')}...`);
  }
}

// 3. 五行分布
console.log('\n3️⃣  五行分布:');
const wuxingDist = {};
wuxingData.characters.forEach(item => {
  wuxingDist[item.wuxing] = (wuxingDist[item.wuxing] || 0) + 1;
});
Object.entries(wuxingDist).sort((a, b) => b[1] - a[1]).forEach(([wx, count]) => {
  console.log(`   ${wx}: ${count} 个字`);
});

// 4. 声调分布
console.log('\n4️⃣  声调分布:');
const toneDist = {};
pinyinData.characters.forEach(item => {
  toneDist[item.tone] = (toneDist[item.tone] || 0) + 1;
});
[1, 2, 3, 4, 5].forEach(tone => {
  const count = toneDist[tone] || 0;
  const toneName = tone === 5 ? '轻声' : `${tone}声`;
  console.log(`   ${toneName}: ${count} 个字`);
});

// 5. 诗词作者分布
console.log('\n5️⃣  唐诗作者分布（前5名）:');
const authorDist = {};
tangshiData.poems.forEach(poem => {
  authorDist[poem.author] = (authorDist[poem.author] || 0) + 1;
});
Object.entries(authorDist)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .forEach(([author, count]) => {
    console.log(`   ${author}: ${count} 首`);
  });

// 6. 数据示例
console.log('\n6️⃣  数据示例（"涵"字）:');
const testChar = '涵';
const wuxingItem = wuxingData.characters.find(c => c.char === testChar);
const strokeItem = strokesData.characters.find(c => c.char === testChar);
const pinyinItem = pinyinData.characters.find(c => c.char === testChar);

if (wuxingItem && strokeItem && pinyinItem) {
  console.log(`   字: ${testChar}`);
  console.log(`   五行: ${wuxingItem.wuxing}`);
  console.log(`   笔画: ${strokeItem.strokes}`);
  console.log(`   拼音: ${pinyinItem.pinyin}`);
  console.log(`   声调: ${pinyinItem.tone}声`);
  console.log(`   声母: ${pinyinItem.shengmu || '零声母'}`);
  console.log(`   韵母: ${pinyinItem.yunmu}`);
} else {
  console.log(`   ⚠️  "${testChar}"字数据不完整`);
}

console.log('\n' + '='.repeat(50));
console.log('✅ 验证完成！\n');
