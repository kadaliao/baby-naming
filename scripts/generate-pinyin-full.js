const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin');

/**
 * 完整版拼音生成器 - 覆盖所有常用汉字
 *
 * 数据来源：
 * 1. Unicode CJK 统一汉字基本区（U+4E00 到 U+9FFF）中的常用字
 * 2. GB2312 一级常用字范围（3755个）
 * 3. 确保覆盖所有取名、姓氏、诗词中可能出现的汉字
 */

// 声母表
const shengmu = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w'];

function getShengmu(pinyinStr) {
  for (const sm of shengmu) {
    if (pinyinStr.startsWith(sm)) {
      return sm;
    }
  }
  return '';
}

function getYunmu(pinyinStr) {
  const sm = getShengmu(pinyinStr);
  return pinyinStr.slice(sm.length);
}

function getTone(pinyinWithTone) {
  if (/[āēīōūǖ]/.test(pinyinWithTone)) return 1;
  if (/[áéíóúǘ]/.test(pinyinWithTone)) return 2;
  if (/[ǎěǐǒǔǚ]/.test(pinyinWithTone)) return 3;
  if (/[àèìòùǜ]/.test(pinyinWithTone)) return 4;
  return 5;
}

function generatePinyinForChar(char) {
  const pinyinArr = pinyin(char, {
    style: pinyin.STYLE_TONE,
    heteronym: false
  });

  if (pinyinArr && pinyinArr[0] && pinyinArr[0][0]) {
    const pinyinWithTone = pinyinArr[0][0];
    const pinyinNoTone = pinyin(char, {
      style: pinyin.STYLE_NORMAL,
      heteronym: false
    })[0][0];

    return {
      char: char,
      pinyin: pinyinWithTone,
      pinyinNoTone: pinyinNoTone,
      tone: getTone(pinyinWithTone),
      shengmu: getShengmu(pinyinNoTone),
      yunmu: getYunmu(pinyinNoTone)
    };
  }
  return null;
}

console.log('\n🚀 生成完整拼音数据库（覆盖所有常用汉字）\n');

// 读取 wuxing.json 确保 100% 覆盖取名库
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

const charSet = new Set();
const pinyinData = {
  characters: []
};

// 第一步：添加所有取名库字符（必须100%覆盖）
console.log('📋 步骤 1: 添加取名库字符');
for (const item of wuxingData.characters) {
  charSet.add(item.char);
}
console.log(`   添加 ${charSet.size} 个取名字符\n`);

// 第二步：添加 CJK 基本区常用字（U+4E00 - U+9FFF）
console.log('📋 步骤 2: 扫描 CJK 基本区（U+4E00 - U+9FFF）');
const START_CODE = 0x4E00;
const END_CODE = 0x9FFF + 1; // CJK 基本区结束

let scanCount = 0;
for (let code = START_CODE; code < END_CODE; code++) {
  const char = String.fromCharCode(code);
  charSet.add(char);
  scanCount++;

  if (scanCount % 5000 === 0) {
    console.log(`   已扫描 ${scanCount.toLocaleString()} 个码位...`);
  }
}
console.log(`   扫描完成，字符集大小: ${charSet.size.toLocaleString()}\n`);

// 第三步：为所有字符生成拼音
console.log('📋 步骤 3: 生成拼音数据');
let successCount = 0;
let skipCount = 0;

for (const char of charSet) {
  const result = generatePinyinForChar(char);

  if (result) {
    pinyinData.characters.push(result);
    successCount++;

    if (successCount % 2000 === 0) {
      console.log(`   ✓ 已生成 ${successCount.toLocaleString()} 个拼音...`);
    }
  } else {
    skipCount++;
  }
}

// 按字符排序
pinyinData.characters.sort((a, b) => a.char.localeCompare(b.char, 'zh-CN'));

// 写入文件
const outputPath = path.join(__dirname, '../data/characters/pinyin.json');
fs.writeFileSync(outputPath, JSON.stringify(pinyinData, null, 2), 'utf8');

console.log('\n═'.repeat(60));
console.log(`✅ 拼音数据生成完成:`);
console.log(`   成功: ${successCount.toLocaleString()} 个字符`);
console.log(`   跳过: ${skipCount.toLocaleString()} 个字符（无法获取拼音）`);
console.log(`   文件: ${outputPath}`);
console.log('═'.repeat(60));

// 验证覆盖率
const pinyinChars = new Set(pinyinData.characters.map(c => c.char));

const wuxingCoverage = wuxingData.characters.filter(c => pinyinChars.has(c.char)).length;
console.log(`\n📊 覆盖率检查:`);
console.log(`   取名库字符: ${wuxingData.characters.length.toLocaleString()} 个`);
console.log(`   已覆盖: ${wuxingCoverage.toLocaleString()} 个 (${(wuxingCoverage/wuxingData.characters.length*100).toFixed(1)}%)`);

if (wuxingCoverage < wuxingData.characters.length) {
  const missing = wuxingData.characters.filter(c => !pinyinChars.has(c.char)).map(c => c.char);
  console.log(`   ⚠️  缺失: ${missing.join(', ')}`);
}

// 百家姓验证
const surnames = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '萧', '田', '董', '潘', '袁', '蔡', '蒋', '余',
  '于', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
  '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金'
];
const surnamesCoverage = surnames.filter(s => pinyinChars.has(s)).length;
console.log(`\n   百家姓: ${surnames.length} 个`);
console.log(`   已覆盖: ${surnamesCoverage} 个 (${(surnamesCoverage/surnames.length*100).toFixed(1)}%)`);

if (surnamesCoverage < surnames.length) {
  const missingSurnames = surnames.filter(s => !pinyinChars.has(s));
  console.log(`   ⚠️  缺失: ${missingSurnames.join(', ')}`);
}

// 打印示例
console.log('\n📝 示例数据（验证关键字符）:');
const testChars = ['一', '人', '大', '天', '地', '王', '李', '龙', '凤', '罗', '邓'];
const samples = pinyinData.characters.filter(c => testChars.includes(c.char));
console.log(JSON.stringify(samples, null, 2));
