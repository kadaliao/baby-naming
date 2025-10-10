# Deprecated Scripts

这个目录包含已完成任务或被更好方案替代的脚本，仅供历史参考。

## 目录结构

### `/` - 旧版数据生成脚本

被 `-full.js` 版本替代的数据生成脚本：

- **`generate-pinyin.js`**: 原始拼音生成器 (1,205 chars)
  - **替代者**: `../generate-pinyin-full.js` (20,992 chars, 100% CJK 覆盖)
  - **原因**: 覆盖不足，缺失姓氏和诗词字符

- **`generate-pinyin-extended.js`**: 扩展拼音生成器 (1,295 chars)
  - **替代者**: `../generate-pinyin-full.js` (20,992 chars, 100% CJK 覆盖)
  - **原因**: 仍然不够完整，只是修补而非彻底解决

- **`generate-strokes.js`**: 原始笔画生成器 (1,200 chars)
  - **替代者**: `../generate-strokes-full.js` (20,992 chars, 100% CJK 覆盖)
  - **原因**: 缺失 65% 诗词字符和部分姓氏

### `/data-setup/` - 一次性数据构建脚本

已完成数据构建任务的脚本：

- **`add-surnames.js`**: 添加姓氏到五行数据库
  - **状态**: ✓ 已完成，60个姓氏已添加

- **`check-surnames.js`**: 检查姓氏覆盖率
  - **状态**: ✓ 已完成，100% 覆盖验证通过

- **`build-poetry-database.ts`**: 构建诗词数据库
  - **状态**: ✓ 已完成，393首唐诗已导入

- **`preprocess-poetry.ts`**: 预处理诗词数据
  - **状态**: ✓ 已完成

- **`extend-poetry.js`**: 扩展诗词库（从 30 → 393 首）
  - **状态**: ✓ 已完成，诗词库已扩展至 393 首

- **`expand-wuxing-database.ts`**: 扩展五行数据库
  - **状态**: ✓ 已完成

- **`expand-wuxing-simple.ts`**: 简单扩展五行
  - **状态**: ✓ 已完成

- **`extend-wuxing.js`**: 扩展五行字符
  - **状态**: ✓ 已完成

- **`find-missing-pinyin.js`**: 查找缺失拼音数据
  - **状态**: ✓ 已完成，现在 100% 覆盖，不再需要

### `/exploration/` - 探索和调试脚本

用于学习、调试、一次性验证的脚本：

- **`explore-lunar-api.js`**: 探索 lunar-javascript API 功能
  - **用途**: 学习八字计算 API
  - **状态**: ✓ API 探索完成

- **`test-database.ts`**: 测试数据库操作
  - **用途**: 验证数据库功能
  - **状态**: ✓ 数据库已验证

- **`test-deduplication.ts`**: 测试名字去重逻辑
  - **用途**: 验证去重算法
  - **状态**: ✓ 去重逻辑已验证

- **`test-surnames-scoring.ts`**: 测试姓氏评分
  - **用途**: 验证姓氏评分准确性
  - **状态**: ✓ 评分系统已验证

- **`test-user-system.ts`**: 测试用户认证系统
  - **用途**: 验证用户登录/注册
  - **状态**: ✓ 用户系统已验证

## 当前使用的脚本

保留在 `scripts/` 根目录的活跃脚本：

### 核心数据生成脚本
```bash
node scripts/generate-pinyin-full.js    # 生成完整拼音数据 (20,992 chars)
node scripts/generate-strokes-full.js   # 生成完整笔画数据 (20,992 chars)
node scripts/validate-data.js           # 验证数据一致性
```

### 功能测试脚本
```bash
npx tsx scripts/test-bazi.ts           # 测试八字计算
npx tsx scripts/test-fixed-char.ts     # 测试辈分字功能
npx tsx scripts/test-generator.ts      # 测试名字生成器
npx tsx scripts/test-scoring.ts        # 测试评分算法
```

## 注意事项

⚠️ **不要使用此目录中的脚本**

这些脚本：
1. 要么已被更好的版本替代
2. 要么任务已完成，数据已固化
3. 要么仅用于历史参考

如需重新生成数据，**务必使用 `scripts/` 根目录的最新脚本**。
