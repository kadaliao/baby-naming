# 宝宝取名助手 - 项目计划

## 📋 项目概述

**项目名称**: baby-naming（宝宝取名助手）
**技术栈**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui + Turso (Hybrid DB) + OpenAI API
**当前状态**: ✅ **100% 完成 + Vercel-ready**

结合传统文化（诗词/八字/五行）与现代 AI 技术的智能取名应用。

---

## 🎯 核心功能（已实现）

### 1. 输入系统
- 姓氏、性别、出生日期（八字计算）
- 寓意偏好、辈分字、名字来源选择

### 2. 生成系统（三大生成器）
- **诗词生成器**: 从 393 首唐诗提取优美字词
- **五行生成器**: 根据八字五行推荐补益字（相生算法）
- **AI 生成器**: OpenAI API 创意生成

### 3. 评分系统（100分制，真实算法）
- **五行评分 (25分)**: 八字匹配、五行平衡
- **音律评分 (25分)**: 声调平仄、韵母和谐
- **字形评分 (20分)**: 笔画吉凶、书写美观
- **寓意评分 (30分)**: 诗词典故、偏好匹配

### 4. 用户系统
- 注册/登录、历史记录、收藏管理
- Session 自动迁移（匿名 → 登录用户）

### 5. 数据持久化（Hybrid Database）
- **本地开发**: SQLite (`data/names.db`)
- **生产环境**: Turso LibSQL (serverless)
- 自动检测环境切换，零配置

---

## 📊 数据资源

### 诗词库
- **393 首唐诗** (`data/poetry/tangshi.json`)
- 李白(56)、杜Fu(41)、王维(29)、李商隐(25) 等 95 位诗人

### 字符库
- **5,584 个汉字** (`data/characters/wuxing.json`)
- 完整五行属性、拼音声调、笔画数据

---

## 🔧 开发命令

```bash
# 开发服务器 (端口 16666)
npm run dev

# 生产构建
npm run build

# 生产服务器
npm start

# 测试模块
npx tsx scripts/test-scoring.ts      # 评分系统
npx tsx scripts/test-generator.ts    # 生成器
npx tsx scripts/test-user-system.ts  # 用户系统
```

---

## 🔐 环境变量配置

创建 `.env.local` 文件：

```env
# ========== OpenAI API ==========
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选
AI_MODEL=gpt-4o-mini                         # 可选

# ========== 数据库（本地开发无需配置）==========
# 本地开发：自动使用 SQLite (./data/names.db)
# 生产环境（Vercel + Turso）：
TURSO_URL=libsql://your-db.turso.io         # 必填
TURSO_AUTH_TOKEN=your-auth-token             # 必填
```

---

## 🚀 Vercel 部署

1. **创建 Turso 数据库**
   ```bash
   turso db create baby-naming-prod
   turso db show baby-naming-prod --url
   turso db tokens create baby-naming-prod
   ```

2. **Vercel 环境变量配置**
   - `TURSO_URL`: 数据库 URL
   - `TURSO_AUTH_TOKEN`: 认证 token
   - `OPENAI_API_KEY`: OpenAI API key

3. **部署**
   ```bash
   vercel --prod
   ```

---

## 📝 技术要点

### 数据库架构
- **Client 层**: `lib/db/client.ts` - 统一接口，自动切换 SQLite/Turso
- **Repository 层**: `lib/db/repository.ts` - 全异步 CRUD
- **Migration**: `lib/db/migrations/` - 版本化 schema 演进

### 评分算法（无假算法）
- 音律: 平仄分析 + 韵母检测
- 字形: 笔画数理 + 81 数吉凶
- 五行: 相生关系 + 八字平衡
- 寓意: 诗词匹配 + 偏好分析

### 五行生成器（正确实现）
```
需补水 → 水字 + 金字（金生水）
需补木 → 木字 + 水字（水生木）
避免：水字 + 水字（单一元素，评分低）
```

---

## 📚 参考资源

### 数据来源
- [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) - 唐诗三百首数据
- [lunar-javascript](https://github.com/6tail/lunar-javascript) - 八字计算库

### 技术文档
- [Next.js Docs](https://nextjs.org/docs)
- [Turso Docs](https://docs.turso.tech/)
- [OpenAI API](https://platform.openai.com/docs)

---

## ⚠️ 已知限制

1. **八字计算精度**: 简化实现，未考虑时辰地支藏干
2. **诗词库范围**: 仅唐诗，未包含宋词/诗经
3. **移动端优化**: 基础响应式，未深度优化

---

## 🔄 未来优化（按优先级）

1. **数据扩展**
   - [ ] 扩充诗词库（宋词、诗经）
   - [ ] 添加字义解释数据

2. **功能增强**
   - [ ] 名字对比功能
   - [ ] 批量生成 UI
   - [ ] 导出 PDF/图片

3. **算法优化**
   - [ ] 完整八字藏干算法
   - [ ] 姓名学五格剖象

**注意**: 以上为可选优化，当前版本已完整可用。

---

*最后更新: 2025-10-08*
*项目状态: Production Ready*
