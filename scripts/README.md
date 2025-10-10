# Scripts 使用指南

## 核心数据生成脚本

这些脚本用于生成和验证字符数据库，必须在修改 `wuxing.json` 后运行：

### 1. `generate-pinyin-full.js` - 生成拼音数据

生成完整的拼音数据库（覆盖整个 CJK 基本块 U+4E00-U+9FFF）。

```bash
node scripts/generate-pinyin-full.js
```

**输出**:
- 文件: `data/characters/pinyin.json`
- 覆盖: 20,992 个字符 (100% CJK 基本块)
- 大小: ~5MB
- 耗时: ~30 秒

**数据结构**:
```json
{
  "char": "明",
  "pinyin": "míng",
  "pinyinNoTone": "ming",
  "tone": 2,
  "shengmu": "m",
  "yunmu": "ing"
}
```

### 2. `generate-strokes-full.js` - 生成笔画数据

生成完整的笔画数据库（覆盖整个 CJK 基本块 U+4E00-U+9FFF）。

```bash
node scripts/generate-strokes-full.js
```

**输出**:
- 文件: `data/characters/strokes.json`
- 覆盖: 20,992 个字符 (100% CJK 基本块)
- 方法: chinese-character-strokes (99.92%) + Unihan 估算 (0.08%)
- 大小: ~1.1MB
- 耗时: ~5 秒

**数据结构**:
```json
{
  "char": "明",
  "strokes": 8,
  "estimated": false  // 是否为估算值（仅16个罕见字）
}
```

### 3. `validate-data.js` - 验证数据一致性

验证三个字符数据库的一致性（wuxing, strokes, pinyin）。

```bash
node scripts/validate-data.js
```

**检查项目**:
- 五行字符是否都有笔画数据
- 五行字符是否都有拼音数据
- 数据库之间的覆盖率对比
- 缺失字符列表

## 功能测试脚本

用于验证核心功能的测试脚本：

### `test-bazi.ts` - 测试八字计算

测试 `lunar-javascript` 八字计算功能。

```bash
npx tsx scripts/test-bazi.ts
```

### `test-fixed-char.ts` - 测试辈分字功能

测试固定字符（辈分字）的名字生成。

```bash
npx tsx scripts/test-fixed-char.ts
```

### `test-generator.ts` - 测试名字生成器

测试诗词、五行、AI 三种生成器。

```bash
npx tsx scripts/test-generator.ts
```

### `test-scoring.ts` - 测试评分算法

测试四维评分系统（五行、音律、字形、寓意）。

```bash
npx tsx scripts/test-scoring.ts
```

## 数据更新流程

当修改五行字符数据 (`data/characters/wuxing.json`) 后，必须按顺序运行：

```bash
# 1. 生成笔画数据
node scripts/generate-strokes-full.js

# 2. 生成拼音数据
node scripts/generate-pinyin-full.js

# 3. 验证数据一致性
node scripts/validate-data.js
```

## 已弃用的脚本

旧版本和一次性使用的脚本已移至 `scripts/deprecated/`，详见：
- `scripts/deprecated/README.md` - 完整的弃用脚本说明

**不要使用 deprecated 目录中的脚本！**

## 文件大小参考

| 数据库 | 字符数 | 文件大小 | 生成时间 |
|--------|--------|----------|----------|
| wuxing.json | 1,200 | 170KB | 手动维护 |
| strokes.json | 20,992 | 1.1MB | ~5秒 |
| pinyin.json | 20,992 | 5MB | ~30秒 |

## 常见问题

### Q: 为什么拼音和笔画数据这么大？
A: 为了 100% 覆盖 CJK 基本块（20,992 个字符），确保任何姓名、诗词字符都不会缺失数据。

### Q: 那 16 个使用估算值的字符是什么？
A: U+9FF0-U+9FFF 区间的极罕见生僻字（鿰鿱鿲...），chinese-character-strokes 无法处理，使用 Unihan 数据库估算。这些字在取名中永远不会用到。

### Q: 可以删除旧脚本吗？
A: 已归档到 `deprecated/` 目录，建议保留作为历史参考。如需删除，确保只删除 `deprecated/` 中的文件。

### Q: 测试脚本是否需要定期运行？
A: 不需要。仅在修改相关功能后运行对应测试脚本验证即可。
