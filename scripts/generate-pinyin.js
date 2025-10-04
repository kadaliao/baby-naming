const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin');

// 读取五行数据
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

// 声母表
const shengmu = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];

// 提取声母
function getShengmu(pinyinStr) {
  for (const sm of shengmu) {
    if (pinyinStr.startsWith(sm)) {
      return sm;
    }
  }
  return ''; // 零声母
}

// 提取韵母
function getYunmu(pinyinStr) {
  const sm = getShengmu(pinyinStr);
  return pinyinStr.slice(sm.length);
}

// 提取声调
function getTone(pinyinWithTone) {
  if (/[āēīōūǖ]/.test(pinyinWithTone)) return 1;
  if (/[áéíóúǘ]/.test(pinyinWithTone)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(pinyinWithTone)) return 3;
  if (/[àèìòùǜ]/.test(pinyinWithTone)) return 4;
  return 5; // 轻声
}

// 生成拼音数据
const pinyinData = {
  characters: []
};

for (const item of wuxingData.characters) {
  const char = item.char;

  // 获取拼音（带声调）
  const pinyinArr = pinyin(char, {
    style: pinyin.STYLE_TONE,
    heteronym: false
  });

  if (pinyinArr && pinyinArr[0] && pinyinArr[0][0]) {
    const pinyinWithTone = pinyinArr[0][0];

    // 获取不带声调的拼音
    const pinyinNoTone = pinyin(char, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    })[0][0];

    const tone = getTone(pinyinWithTone);
    const shengmuVal = getShengmu(pinyinNoTone);
    const yunmuVal = getYunmu(pinyinNoTone);

    pinyinData.characters.push({
      char: char,
      pinyin: pinyinWithTone,
      pinyinNoTone: pinyinNoTone,
      tone: tone,
      shengmu: shengmuVal,
      yunmu: yunmuVal
    });
  } else {
    console.warn(`⚠️  无法获取 "${char}" 的拼音数据`);
  }
}

// 写入文件
const outputPath = path.join(__dirname, '../data/characters/pinyin.json');
fs.writeFileSync(outputPath, JSON.stringify(pinyinData, null, 2), 'utf8');

console.log(`✅ 生成拼音数据完成: ${pinyinData.characters.length} 个字`);
console.log(`文件路径: ${outputPath}`);

// 打印示例
if (pinyinData.characters.length > 0) {
  console.log('\n示例数据:');
  console.log(JSON.stringify(pinyinData.characters.slice(0, 3), null, 2));
}
