const fs = require('fs');
const path = require('path');
const strokesLib = require('chinese-character-strokes');
const getStrokeOrder = strokesLib['取笔顺'];

// 读取五行数据
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

// 生成笔画数据
const strokesData = {
  characters: [],
  note: "使用简体字笔画数（非康熙笔画），后续可优化为姓名学标准笔画"
};

for (const item of wuxingData.characters) {
  const char = item.char;
  const strokeOrder = getStrokeOrder(char);

  if (strokeOrder && strokeOrder.length > 0) {
    strokesData.characters.push({
      char: char,
      strokes: strokeOrder.length
    });
  } else {
    // 如果查不到，跳过
    console.warn(`⚠️  无法获取 "${char}" 的笔画数据`);
  }
}

// 写入文件
const outputPath = path.join(__dirname, '../data/characters/strokes.json');
fs.writeFileSync(outputPath, JSON.stringify(strokesData, null, 2), 'utf8');

console.log(`✅ 生成笔画数据完成: ${strokesData.characters.length} 个字`);
console.log(`文件路径: ${outputPath}`);
