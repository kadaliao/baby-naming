# 宝宝取名助手 🍼

一个智能、专业的宝宝取名 Web 应用，结合中国传统文化与现代 AI 技术，为您的宝宝推荐寓意美好的名字。

## ✨ 功能特性

### 核心功能
- 🎯 **多维度输入**：支持姓氏、性别、生辰八字、寓意偏好等多种输入条件
- 📚 **多来源生成**：
  - 诗词典故生成（唐诗宋词、诗经）
  - 五行八字生成（传统命理）
  - AI 智能生成（OpenAI 兼容 API）
  - 组合推荐
- ⭐ **专业评分系统**（总分 100 分）：
  - 五行评分（25分）：八字匹配、五行平衡
  - 音律评分（25分）：声调和谐、韵母搭配
  - 字形评分（20分）：结构平衡、笔画吉凶
  - 寓意评分（30分）：文化内涵、诗词典故
- 📊 **可视化展示**：雷达图、评分详情、诗词出处
- 💾 **记录管理**：历史记录、收藏功能

### 未来扩展
- 📱 微信小程序版本
- 📲 移动 App 版本
- 🔮 周易卦象分析
- 📈 名字趋势分析

## 🛠️ 技术栈

- **前端框架**: Next.js 15 (App Router)
- **开发语言**: TypeScript
- **样式方案**: Tailwind CSS + shadcn/ui
- **数据库**: SQLite (可升级 PostgreSQL)
- **AI 服务**: OpenAI API（兼容格式）
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
# OpenAI API Key
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# 如果使用第三方兼容服务，修改此 URL
OPENAI_BASE_URL=https://api.openai.com/v1

# AI 模型
AI_MODEL=gpt-4o-mini
```

### 4. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

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
│   ├── result/            # 结果展示页
│   └── history/           # 历史记录页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── forms/            # 表单组件
│   ├── results/          # 结果展示组件
│   └── layout/           # 布局组件
├── lib/                   # 核心库
│   ├── ai/               # AI 相关
│   ├── scoring/          # 评分算法
│   ├── generator/        # 名字生成器
│   ├── bazi/             # 八字计算
│   ├── db/               # 数据库
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
   - 从唐诗宋词中提取字词
   - 保留诗词出处

2. **五行生成器** (`lib/generator/wuxing.ts`)
   - 根据八字推荐五行字
   - 五行平衡优化

3. **AI 生成器** (`lib/generator/ai.ts`)
   - 调用 OpenAI API
   - 创意名字推荐

## 📊 数据资源

项目需要以下数据资源（逐步添加）：

- ✅ 诗词库：唐诗300首、宋词精选
- ✅ 汉字库：常用字3000+ 五行属性
- ✅ 笔画数据：汉字笔画信息
- ⏳ 寓意解释：汉字寓意数据库

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

# 类型检查
npm run type-check
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
  "sources": ["诗词", "五行", "AI"]
}
```

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

**整体完成度：15-20%**

✅ **能用的功能：**
- 前端输入表单（姓氏、性别、偏好）
- AI 生成名字（OpenAI API）
- 基础结果展示

⚠️ **简化版（技术债务）：**
- 评分系统（只是字数计数，不是真正的五行/音律/字形/寓意算法）

❌ **未完成：**
- 诗词数据、汉字数据（空的）
- 八字计算（不存在）
- 诗词生成器、五行生成器（不存在）
- 数据库（不存在）
- 雷达图、详细评分展示（不存在）

🔴 **严重问题：`lib/scoring/simple.ts` 全是假算法，需要重写**

详细开发计划和技术债务清单请查看 [PLAN.md](./PLAN.md)
