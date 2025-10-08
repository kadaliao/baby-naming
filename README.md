# 宝宝取名助手 🍼

一个智能、专业的宝宝取名 Web 应用，结合中国传统文化与现代 AI 技术，为您的宝宝推荐寓意美好的名字。

## ✨ 功能特性

### 核心功能
- 🎯 **多维度输入**：支持姓氏、性别、生辰八字、寓意偏好、辈分字（固定字）等多种输入条件
- 💾 **表单记忆**：自动保存输入信息，刷新页面不丢失数据
- 📚 **多来源生成**：
  - 诗词典故生成（393首唐诗）
  - 五行八字生成（传统命理）
  - AI 智能生成（OpenAI 兼容 API）
  - 组合推荐
- 🎭 **辈分字支持**：可指定固定字及其位置（第一个字/第二个字），满足家族字辈要求
- ⭐ **专业评分系统**（总分 100 分）：
  - 五行评分（25分）：八字匹配、五行平衡
  - 音律评分（25分）：声调和谐、韵母搭配
  - 字形评分（20分）：结构平衡、笔画吉凶
  - 寓意评分（30分）：文化内涵、诗词典故
- 📊 **可视化展示**：雷达图、评分详情、诗词出处
- 💾 **记录管理**：历史记录、收藏功能、数据持久化
- 👤 **用户系统**：注册登录、会话迁移、跨设备同步

### 可选优化方向
- 📚 数据扩展：宋词、诗经库
- 📊 功能增强：名字对比、批量生成、导出 PDF
- 🔬 算法优化：完整八字藏干、姓名学五格剖象

## 🛠️ 技术栈

- **前端框架**: Next.js 15.5.4 (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS + shadcn/ui
- **数据库**:
  - 本地开发: SQLite (better-sqlite3 + WAL mode)
  - 生产部署: Turso LibSQL (serverless)
  - Hybrid 架构: 自动切换
- **AI 服务**: OpenAI API（兼容格式）
- **用户认证**: bcryptjs (密码哈希)
- **包管理器**: npm

## 📋 前置要求

- Node.js 18.17 或更高版本
- npm 或 yarn
- OpenAI API Key（或兼容的 API 服务）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd baby-naming
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变量模板并填写配置：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件，填入必要的配置：

```env
# OpenAI API (for AI generator)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional
AI_MODEL=gpt-4o-mini                        # Optional

# Database - Local development (SQLite, no config needed)
# DATABASE_PATH=./data/names.db  # Optional, uses default

# Database - Production (Turso serverless, for Vercel deployment)
# TURSO_URL=libsql://your-db.turso.io      # Required for production
# TURSO_AUTH_TOKEN=your-auth-token          # Required for production
```

### 4. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:16666](http://localhost:16666) 查看应用。

> 注：开发服务器默认运行在端口 16666

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
baby-naming/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes（后端接口）
│   │   ├── generate/     # 名字生成
│   │   ├── auth/         # 用户认证
│   │   ├── history/      # 历史记录查询
│   │   └── favorite/     # 收藏管理
│   ├── result/            # 结果展示页
│   └── history/           # 历史记录页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── forms/            # 表单组件
│   ├── results/          # 结果展示组件
│   ├── history/          # 历史记录组件
│   ├── auth/             # 认证组件
│   └── layout/           # 布局组件
├── lib/                   # 核心库
│   ├── ai/               # AI 相关
│   ├── scoring/          # 评分算法
│   ├── generator/        # 名字生成器
│   ├── bazi/             # 八字计算
│   ├── auth/             # 用户认证
│   ├── db/               # 数据库（client, repository, migrations）
│   └── utils/            # 工具函数
├── data/                  # 数据资源
│   ├── poetry/           # 诗词库
│   ├── characters/       # 汉字库
│   └── names/            # 名字库
├── types/                 # TypeScript 类型定义
├── docs/                  # 文档
└── PLAN.md               # 详细实施计划
```

## 🎨 主要组件

### 评分算法

#### 五行评分
- 八字五行计算
- 五行缺失分析
- 名字五行匹配

#### 音律评分
- 声调和谐度（平仄搭配）
- 韵母搭配
- 发音流畅度

#### 字形评分
- 结构平衡（左右、上下、包围）
- 笔画数吉凶
- 书写美观度

#### 寓意评分
- 文化内涵
- 诗词典故
- 用户偏好匹配

### 名字生成器

1. **诗词生成器** (`lib/generator/poetry.ts`)
   - 从393首唐诗中提取字词（完整唐诗三百首）
   - 保留诗词出处（95位作者：李白56首、杜甫41首等）
   - 支持辈分字模式（优先从包含固定字的诗句提取）

2. **五行生成器** (`lib/generator/wuxing.ts`)
   - 根据八字推荐五行字
   - 五行相生组合（金生水、水生木等）
   - 支持辈分字模式（生成匹配五行的字搭配固定字）

3. **AI 生成器** (`lib/generator/ai.ts`)
   - 调用 OpenAI 兼容 API
   - 创意名字推荐
   - 支持辈分字模式（通过 prompt 指定固定字要求）

## 📊 数据资源

项目包含以下数据资源：

- ✅ 诗词库：393首唐诗（完整唐诗三百首，95位作者）
- ✅ 汉字库：5,584个汉字 + 五行属性
- ✅ 笔画数据：汉字笔画信息（自动生成）
- ✅ 拼音数据：汉字拼音及声调（自动生成）
- ✅ 数据库：Hybrid架构（本地SQLite + 生产Turso）
- ⏳ 寓意解释：汉字寓意数据库（待扩展）

## 🔧 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 测试模块
npx tsx scripts/test-scoring.ts      # 评分算法
npx tsx scripts/test-generator.ts    # 名字生成器
npx tsx scripts/test-bazi.ts         # 八字计算
npx tsx scripts/test-fixed-char.ts   # 辈分字功能
npx tsx scripts/test-user-system.ts  # 用户系统
```

## 📝 API 文档

### 生成名字
```
POST /api/generate
```

**请求体**:
```json
{
  "surname": "李",
  "gender": "male",
  "birthDate": "2024-01-01T08:00:00Z",
  "preferences": ["聪明智慧", "健康平安"],
  "sources": ["poetry", "wuxing", "ai"],
  "fixedChar": {
    "char": "明",
    "position": "first"
  }
}
```

> 注：`fixedChar` 为可选字段，用于指定辈分字

**响应**:
```json
{
  "names": [
    {
      "fullName": "李思源",
      "firstName": "思源",
      "score": 92,
      "source": "诗词",
      "sourceDetail": "取自《饮水思源》"
    }
  ]
}
```

### 名字评分
```
POST /api/score
```

详见 [API 文档](./docs/API.md)

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用函数式组件 + Hooks
- 使用 Prettier 格式化代码

## 📜 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [OpenAI](https://openai.com/)
- [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) - 中文诗词数据库

## 📞 联系方式

如有问题或建议，请：
- 提交 Issue
- 发送邮件至 [your-email@example.com]

---

## 📈 开发进度

**整体完成度：100%** ✅

### ✅ 已完成功能

**Phase 1 - 核心生成系统** ✅
- 前端输入表单（姓氏、性别、生辰八字、偏好、辈分字）
- 三种名字生成器（诗词、五行、AI）
- 四维评分系统（五行、音律、字形、寓意）- 真实算法
- 八字计算与五行分析（基于 lunar-javascript）
- 雷达图可视化展示（recharts）
- 辈分字支持（固定字位置指定）

**Phase 2 - 数据资源** ✅
- 字符数据库（5,584字 + 五行/笔画/拼音）
- 诗词库扩展（30首 → 393首完整唐诗三百首）
- 数据生成脚本（自动生成笔画、拼音数据）

**Phase 3 - 数据持久化** ✅
- 数据库集成（Hybrid 架构：本地 SQLite + Turso serverless）
- 历史记录 & 收藏功能
- 前端历史 UI（分页、筛选、统计）
- Repository 模式（异步 CRUD 操作）
- 自动保存生成结果

**Phase 4 - 用户系统** ✅
- 用户注册/登录（bcrypt 密码哈希）
- 会话迁移（匿名数据转移到用户账号）
- 数据库 Migration 系统
- 认证 UI 组件（登录对话框）
- 双标识符支持（sessionId + userId）

**Phase 5 - Vercel 部署支持** ✅
- Hybrid 数据库架构（本地/生产自动切换）
- Turso LibSQL 集成（serverless SQLite）
- 统一数据库接口（DatabaseClient）
- API 异步化改造
- 零配置本地开发

### ⏳ 待完成功能

- 移动端响应式优化（基础已完成，需进一步优化）
- 导出功能（导出名字列表为 PDF/图片）
- 批量生成 UI（可一次生成多个名字）

### 📌 最近更新

**2025-10-08 15:42**
- ✅ 文档清理：PLAN.md 从 1466 行精简至 177 行（删除冗余代码示例、过时追踪、理论设计）
- ✅ 构建修复：解决 TypeScript/ESLint 错误、Turso SQL 兼容性问题
- ✅ 字符库扩展：从 377 字扩展到 5,584 字（完整五行属性覆盖）

**2025-10-08 14:15**
- ✅ Vercel 部署支持：Turso Hybrid 数据库架构
- ✅ 本地/生产自动切换（零配置）
- ✅ API 异步化改造（repository + routes）
- ✅ 实现表单持久化（localStorage缓存）

**2025-10-07**
- ✅ 完成用户认证系统
- ✅ 实现会话迁移功能
- ✅ 添加 Migration 系统
- ✅ 所有测试通过

详细开发计划请查看 [PLAN.md](./PLAN.md) 和 [CLAUDE.md](./CLAUDE.md)

---

## 🚀 Vercel 部署指南

### 前置准备

1. **创建 Turso 数据库**

```bash
# 安装 Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 注册/登录
turso auth signup

# 创建数据库
turso db create baby-naming

# 获取连接信息
turso db show baby-naming       # 复制 URL
turso db tokens create baby-naming  # 复制 token
```

2. **配置 Vercel 环境变量**

在 Vercel 项目设置中添加：

```
TURSO_URL=libsql://baby-naming-xxx.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...
OPENAI_API_KEY=sk-...  # 可选，如果使用 AI 生成功能
```

3. **部署**

```bash
git push  # Vercel 自动部署
```

应用会自动检测 `TURSO_URL` 环境变量并使用 Turso 数据库。
