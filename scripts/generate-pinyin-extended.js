const fs = require('fs');
const path = require('path');
const { pinyin } = require('pinyin');

// 读取现有五行数据（取名用字）
const wuxingPath = path.join(__dirname, '../data/characters/wuxing.json');
const wuxingData = JSON.parse(fs.readFileSync(wuxingPath, 'utf8'));

// 常见百家姓（完整版，含复姓）
const surnames = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '萧', '田', '董', '潘', '袁', '蔡', '蒋', '余',
  '于', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈',
  '姚', '卢', '姜', '崔', '钟', '谭', '陆', '汪', '范', '金',
  '石', '廖', '贾', '夏', '韦', '付', '方', '白', '邹', '孟',
  '熊', '秦', '邱', '江', '尹', '薛', '闫', '段', '雷', '侯',
  '龙', '史', '陶', '黎', '贺', '顾', '毛', '郝', '龚', '邵',
  '万', '钱', '严', '覃', '武', '戴', '莫', '孔', '向', '汤',
  // 追加更多姓氏
  '温', '康', '施', '文', '牛', '樊', '葛', '邢', '路', '关',
  '纪', '舒', '柳', '盛', '祝', '包', '宁', '欧', '甘', '左',
  '应', '房', '缪', '全', '伍', '余', '元', '卜', '顾', '孟',
  '平', '花', '方', '俞', '任', '袁', '柳', '酆', '鲍', '史',
  '唐', '费', '廉', '岑', '薛', '雷', '贺', '倪', '汤', '滕',
  '殷', '罗', '毕', '郝', '邬', '安', '常', '乐', '于', '时',
  '傅', '皮', '卞', '齐', '康', '伍', '余', '元', '卜', '顾',
  '孟', '平', '黄', '和', '穆', '萧', '尹', '姚', '邵', '湛'
];

// 常用汉字（国标一级常用字 3500）- 这里先放一部分，后面可以扩展
const commonChars = [
  '的', '一', '是', '在', '不', '了', '有', '和', '人', '这',
  '中', '大', '为', '上', '个', '国', '我', '以', '要', '他',
  '时', '来', '用', '们', '生', '到', '作', '地', '于', '出',
  '就', '分', '对', '成', '会', '可', '主', '发', '年', '动',
  '同', '工', '也', '能', '下', '过', '子', '说', '产', '种',
  '面', '而', '方', '后', '多', '定', '行', '学', '法', '所',
  '民', '得', '经', '十', '三', '之', '进', '着', '等', '部',
  '度', '家', '电', '力', '里', '如', '水', '化', '高', '自',
  '二', '理', '起', '小', '物', '现', '实', '加', '量', '都',
  '两', '体', '制', '机', '当', '使', '点', '从', '业', '本',
];

// 收集所有需要生成拼音的字符
const allChars = new Set();

// 1. 添加 wuxing.json 中的字符
wuxingData.characters.forEach(item => {
  allChars.add(item.char);
});

// 2. 添加所有姓氏
surnames.forEach(char => {
  allChars.add(char);
});

// 3. 添加常用字
commonChars.forEach(char => {
  allChars.add(char);
});

console.log(`\n📊 待生成拼音的字符总数: ${allChars.size}`);

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

let successCount = 0;
let failCount = 0;

for (const char of allChars) {
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

    successCount++;
  } else {
    console.warn(`⚠️  无法获取 "${char}" 的拼音数据`);
    failCount++;
  }
}

// 按字符排序
pinyinData.characters.sort((a, b) => a.char.localeCompare(b.char, 'zh-CN'));

// 写入文件
const outputPath = path.join(__dirname, '../data/characters/pinyin.json');
fs.writeFileSync(outputPath, JSON.stringify(pinyinData, null, 2), 'utf8');

console.log(`\n✅ 拼音数据生成完成:`);
console.log(`   成功: ${successCount} 个字`);
console.log(`   失败: ${failCount} 个字`);
console.log(`   文件: ${outputPath}`);

// 验证百家姓覆盖
const generatedChars = new Set(pinyinData.characters.map(c => c.char));
const missingSurnames = surnames.filter(s => !generatedChars.has(s));

console.log(`\n📋 百家姓覆盖验证:`);
console.log(`   总数: ${surnames.length}`);
console.log(`   已覆盖: ${surnames.length - missingSurnames.length}`);
if (missingSurnames.length > 0) {
  console.log(`   ❌ 仍缺失: ${missingSurnames.join(', ')}`);
} else {
  console.log(`   ✅ 全部覆盖！`);
}

// 打印示例
if (pinyinData.characters.length > 0) {
  console.log('\n示例数据:');
  const samples = pinyinData.characters.filter(c => ['王', '李', '张', '罗', '邓'].includes(c.char));
  console.log(JSON.stringify(samples, null, 2));
}
