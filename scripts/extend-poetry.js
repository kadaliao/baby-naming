/**
 * 扩展诗词库：从 chinese-poetry 项目导入《唐诗三百首》
 *
 * 数据源格式：
 * {
 *   author: string,
 *   paragraphs: string[],
 *   tags: string[],
 *   title: string,
 *   id: string (UUID)
 * }
 *
 * 目标格式：
 * {
 *   id: number,
 *   title: string,
 *   author: string,
 *   dynasty: string,
 *   content: string,
 *   type: string
 * }
 */

const fs = require('fs');
const path = require('path');

// 1. 读取当前的 tangshi.json
const currentPath = path.join(__dirname, '../data/poetry/tangshi.json');
const currentData = JSON.parse(fs.readFileSync(currentPath, 'utf-8'));
const currentPoems = currentData.poems;
const startId = currentPoems.length + 1;

console.log(`当前诗词数量: ${currentPoems.length}`);
console.log(`新诗词 ID 起始: ${startId}`);

// 2. 从 URL 获取唐诗三百首数据
const https = require('https');

const sourceUrl = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/全唐诗/唐诗三百首.json';

https.get(sourceUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const sourcePoems = JSON.parse(data);
    console.log(`获取到源数据: ${sourcePoems.length} 首`);

    // 3. 转换格式
    const newPoems = sourcePoems.map((poem, index) => {
      // 合并 paragraphs 为 content
      const content = poem.paragraphs.join('');

      // 从 tags 中提取 type
      const typeTag = poem.tags.find(tag =>
        tag.includes('律诗') ||
        tag.includes('绝句') ||
        tag.includes('古诗') ||
        tag.includes('乐府')
      ) || '诗';

      return {
        id: startId + index,
        title: poem.title,
        author: poem.author,
        dynasty: '唐',
        content: content,
        type: typeTag
      };
    });

    // 4. 去重：检查是否有重复的标题+作者
    const existingKeys = new Set(
      currentPoems.map(p => `${p.title}-${p.author}`)
    );

    const uniqueNewPoems = newPoems.filter(p => {
      const key = `${p.title}-${p.author}`;
      return !existingKeys.has(key);
    });

    console.log(`去重后新增: ${uniqueNewPoems.length} 首`);

    // 5. 合并数据
    const mergedPoems = [...currentPoems, ...uniqueNewPoems];

    // 6. 统计信息
    const stats = {
      total: mergedPoems.length,
      byAuthor: {},
      byType: {}
    };

    mergedPoems.forEach(p => {
      stats.byAuthor[p.author] = (stats.byAuthor[p.author] || 0) + 1;
      stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;
    });

    console.log('\n统计信息:');
    console.log(`总数: ${stats.total}`);
    console.log('\n按作者统计 (前10):');
    Object.entries(stats.byAuthor)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([author, count]) => {
        console.log(`  ${author}: ${count}首`);
      });

    console.log('\n按类型统计:');
    Object.entries(stats.byType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}首`);
      });

    // 7. 写入文件
    const output = {
      poems: mergedPoems
    };

    fs.writeFileSync(
      currentPath,
      JSON.stringify(output, null, 2),
      'utf-8'
    );

    console.log(`\n✅ 成功写入 ${currentPath}`);
    console.log(`   原有: ${currentPoems.length} 首`);
    console.log(`   新增: ${uniqueNewPoems.length} 首`);
    console.log(`   总计: ${mergedPoems.length} 首`);
  });
}).on('error', (err) => {
  console.error('❌ 获取数据失败:', err.message);
  process.exit(1);
});
