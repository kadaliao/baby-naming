# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**宝宝取名助手** - A Chinese baby naming application combining traditional culture (诗词/八字/五行) with modern AI technology.

**Tech Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + OpenAI API

**Current Status**: 100% complete + Vercel-ready. All core functionality implemented: generators, scoring, UI, fixed-char feature, database persistence, history UI, user authentication system, hybrid database support, and dark/light theme switching. Poetry database: 393 poems. Character database: 5,584 chars.

**Last Updated**: 2025-10-08 19:19

## Recent Changes

- **Dark/Light Theme** (2025-10-08): Complete theme switching system with localStorage persistence
  - ThemeProvider: `lib/theme/provider.tsx` with Context API and system preference detection
  - ThemeToggle: Button component with Sun/Moon icons (added to home and history pages)
  - CSS: Tailwind dark mode configured via `globals.css` with comprehensive dark variants
  - Persistence: Auto-saves theme preference to localStorage
  - Zero hydration issues: Provider always renders with consistent initial state
  - Implementation: <100 lines total, zero business logic changes
- **Documentation Cleanup** (2025-10-08): Streamlined PLAN.md from 1466 lines to 177 lines
  - Removed 500+ lines of redundant code examples (implementation details belong in `lib/`, not planning docs)
  - Eliminated 9 outdated phase tracking sections (project is 100% complete, phase tracking obsolete)
  - Deleted theoretical future expansions (小程序/App versions, 周易卦象 - all non-existent requirements)
  - Kept only actionable information: deployment steps, environment config, real tech stack
  - Result: Concise, practical documentation reflecting actual project state
- **Build System Fixes** (recent commits): Resolved TypeScript and ESLint errors blocking production builds
  - Fixed multi-statement SQL splitting for Turso compatibility
  - Resolved all TypeScript compilation errors
  - Cleaned up ESLint errors in database layer
  - Disabled Turbopack for production builds (compatibility issues)
- **Hybrid Database (Turso)** (混合数据库部署支持): Migrated to Turso-compatible hybrid architecture for Vercel deployment
  - Architecture: Auto-switches between local SQLite (dev) and Turso LibSQL (production)
  - Client layer: `lib/db/client.ts` with unified `DatabaseClient` interface
  - Repository layer: Converted all functions to async/await (`lib/db/repository.ts`)
  - API updates: All 3 routes (`/api/generate`, `/api/history`, `/api/favorite`) now async
  - Dependencies: Added `@libsql/client` (^0.14.0), kept `better-sqlite3` for local dev
  - Environment: Auto-detects `TURSO_URL` env var to switch modes
  - Testing: Verified local SQLite mode working correctly
  - Deployment ready: Zero code changes needed for Vercel production deployment
- **Form Persistence** (表单持久化): Added localStorage-based form caching for better UX
  - Auto-saves form values on submit (surname, fixedChar, gender, birthDate, etc.)
  - Auto-loads cached values on page reload
  - Prevents data loss when navigating away
  - Implementation: `NameInputForm.tsx` with `useEffect` hook and localStorage API
- **User Authentication System** (用户认证系统): Complete user login/registration system with session migration
  - Database: Migration-based schema evolution with `lib/db/migrations/001_add_users.sql`
  - Auth logic: `lib/auth/user.ts` with bcrypt password hashing (10 rounds)
  - API: `/api/auth` endpoint supporting both registration and login in one call
  - UI: `AuthDialog.tsx` modal component with username/password fields
  - Session migration: Seamlessly migrate anonymous session data to user accounts
  - Repository updates: All data access functions support both `sessionId` and `userId`
  - History integration: History page automatically uses userId when logged in
  - Testing: Full test suite in `scripts/test-user-system.ts` (all tests passing)
  - UX: Shows current user in header, auto-migration message on first login
- **History UI** (历史记录界面): Implemented frontend for browsing history and favorites
  - Page: `/history` with tabs for all records and favorites only
  - Components: `HistoryList.tsx` (card-based display), `StatsCard.tsx` (dashboard stats)
  - Features: Toggle favorite (star icon), delete records, time formatting (今天/昨天/N天前)
  - Session management: localStorage-based session_id for anonymous users
  - Navigation: Added "历史记录" button to home page header
  - Icons: Uses lucide-react for UI icons (Star, Trash2, Calendar, Award, etc.)
- **Database persistence** (数据库持久化): Implemented database-based history and favorites
  - Schema: Single-table design (`generated_names`) with session_id and user_id support
  - Repository pattern: `lib/db/client.ts` + `lib/db/repository.ts` with full CRUD operations
  - APIs: `/api/generate` (auto-saves), `/api/history` (with stats), `/api/favorite` (toggle/note/delete)
  - Testing: All endpoints verified working (generate → save → query → favorite)
  - Local dev: SQLite with `data/names.db` (WAL mode)
  - Production: Turso serverless database
  - Dependencies: `@libsql/client` ^0.14.0, `better-sqlite3` ^11.8.1
- **Poetry database expansion** (诗词库扩展): Expanded from 30 to 393 Tang poems (13x growth)
  - Imported complete "Three Hundred Tang Poems" (唐诗三百首) from chinese-poetry project
  - 95 authors covered: Li Bai (56), Du Fu (41), Wang Wei (29), Li Shangyin (25), etc.
  - Script: `scripts/extend-poetry.js` - automated import with deduplication
  - Verified: Poetry generator working normally with expanded dataset
- **Fixed-char feature** (辈分字): Added support for specifying fixed character at specific position
  - Updated all generators (poetry, wuxing, AI) to support `fixedChar` parameter
  - Added UI controls in NameInputForm for fixed char input and position selection
  - Backward compatible: existing code works unchanged when fixedChar is not provided
  - Test script: `scripts/test-fixed-char.ts`
- **Scoring system**: Implemented all 4 dimensions (wuxing, yinlu, zixing, yuyi) with real algorithms
- **UI enhancements**: Added ScoreRadar.tsx component with recharts integration, updated NameCard with collapsible radar
- **Dependencies**: Added `lunar-javascript` (v1.7.4) and `recharts` (v2.15.0)
- **Data infrastructure**: Created character databases (wuxing, strokes, pinyin) and Tang poetry dataset (393 poems)
- **Generators**: Implemented poetry and wuxing generators with bazi integration
- **Utilities**: Added data-loader.ts for consistent character data access
- **Scripts**: Created data generation and exploration utilities (generate-pinyin, extend-wuxing, explore-lunar-api, test-fixed-char, extend-poetry)

## Development Commands

```bash
# Start development server (runs on port 16666 by default)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Test specific modules
npx tsx scripts/test-scoring.ts      # Test scoring algorithms
npx tsx scripts/test-generator.ts    # Test name generators
npx tsx scripts/test-bazi.ts         # Test bazi calculator
npx tsx scripts/test-fixed-char.ts   # Test fixed-char feature
```

## Architecture Overview

### Core Data Flow

```
User Input → Generator(s) → Candidates → Scoring → Sorted Results → UI Display
                ↓
         Bazi Calculator (if birthDate provided)
                ↓
         Wuxing Needs → Wuxing Generator
```

### Key Modules

#### 1. Name Generators (`lib/generator/`)

Three independent generators that produce `NameCandidate[]`:

- **`poetry.ts`**: Extracts characters from 30 Tang poems (`data/poetry/tangshi.json`)
  - Returns candidates with poetry source details
  - Can filter by gender and wuxing needs
  - Supports fixed-char mode: generates only the non-fixed character, prioritizes poems containing both chars

- **`wuxing.ts`**: Generates names based on Five Elements theory
  - Uses wuxing mutual generation (相生): 金生水, 水生木, 木生火, 火生土, 土生金
  - Prioritizes element combinations that support each other
  - Example: If need 水(Water), combines 水 chars with 金(Metal) chars (金生水)
  - Supports fixed-char mode: generates characters matching wuxing needs to pair with fixed char

- **`ai.ts`**: Calls OpenAI API for creative name generation
  - Requires `OPENAI_API_KEY` in `.env.local`
  - Supports fixed-char mode via prompt instruction

**Integration**: `app/api/generate/route.ts` orchestrates multiple generators based on `input.sources[]`

#### 2. Scoring System (`lib/scoring/`)

Four-dimensional scoring (total 100 points):

- **`wuxing.ts`** (25 pts): Five Elements balance and mutual generation
- **`yinlu.ts`** (25 pts): Phonetic patterns (平仄 ping-ze tones, rhyme matching)
- **`zixing.ts`** (20 pts): Character form (stroke count, 81-number numerology)
- **`yuyi.ts`** (30 pts): Meaning (poetry sources, preference matching)

**Data Dependencies**:
- `data/characters/wuxing.json` - 5,584 chars with Five Elements tags
- `data/characters/strokes.json` - Generated stroke counts
- `data/characters/pinyin.json` - Generated pinyin with tone info

**Critical**: All scoring functions use REAL algorithms, not fake placeholders. The old `lib/scoring/simple.ts` was garbage code (just counted chars) and should be ignored.

#### 3. Bazi Calculator (`lib/bazi/calculator.ts`)

Uses `lunar-javascript` to convert Gregorian dates to Chinese lunar calendar and extract 八字 (Eight Characters):

```typescript
calculateBazi(birthDate: Date) → {
  bazi: { year, month, day, hour },  // 四柱干支
  wuxing: { 金, 木, 水, 火, 土 },      // Five Elements count
  lacking: string[],                   // Missing elements
  needs: string[]                      // Recommended elements to supplement
}
```

**Integration**: When user provides `birthDate` and selects `wuxing` source, API automatically calculates bazi to determine which elements to supplement.

### Data Generation Scripts (`scripts/`)

Character property data is auto-generated from source data:

```bash
# Generate stroke data from wuxing.json
node scripts/generate-strokes.js

# Generate pinyin data from wuxing.json
node scripts/generate-pinyin.js

# Validate consistency across all three datasets
node scripts/validate-data.js
```

**Important**: After adding new characters to `data/characters/wuxing.json`, MUST regenerate strokes and pinyin data.

### UI Components (`components/`)

**Key Components**:
- `results/NameCard.tsx` - Main card displaying name with collapsible radar chart
- `results/ScoreRadar.tsx` - Four-dimensional radar chart using recharts
- Poetry sources get special gradient background display

**State Management**: Client-side only, no global state. Each component manages its own state with React hooks.

## Critical Technical Details

### 1. Character Database Structure

All character data must maintain consistency across three files:
- `data/characters/wuxing.json` - Source of truth (5,584 chars)
- `data/characters/strokes.json` - Auto-generated
- `data/characters/pinyin.json` - Auto-generated

**Expansion Process**:
1. Add chars to `wuxing.json` with Five Elements tags
2. Run `generate-strokes.js` and `generate-pinyin.js`
3. Run `validate-data.js` to ensure 100% consistency

### 2. Wuxing Generator Algorithm

**The Fix**: Original design was broken (generated 海海, 林林 → single element → scored low).

**Correct Design**:
```typescript
// Generate: target element + element that generates it
// Example: Need Water → combine Water chars + Metal chars (金生水)
const helperWuxing = shengByMap[targetWuxing]; // 水 → 金
generateDoubleChar(targetChars, helperChars); // 水字 + 金字
```

This produces names like "鑫海" (金+水, 金生水) instead of "海海" (水+水, no generation).

### 3. API Route Pattern

`app/api/generate/route.ts` uses source-based routing:

```typescript
for (const source of input.sources) {
  if (source === 'poetry') { /* ... */ }
  else if (source === 'wuxing') {
    // Auto-detect: birthDate exists? → bazi calc, else fallback
    const wuxingNeeds = input.birthDate
      ? calculateBazi(input.birthDate).needs
      : guessWuxingNeeds(input.preferences);
  }
}
```

### 4. Type System

Core types in `types/name.ts`:
- `NameCandidate` - Generated name with source info
- `ScoreResult` - Four-dimensional scoring result
- `Gender` - 'male' | 'female' | 'neutral'
- `NameSource` - 'poetry' | 'wuxing' | 'ai' | 'custom'
- `NamingInput.fixedChar` - Optional fixed character with position ('first' | 'second')

## Common Pitfalls

1. **Don't modify scoring algorithms without understanding the full pipeline** - Each dimension has specific max scores (25/25/20/30). Changing one affects grade calculation.

2. **lunar-javascript API gotcha**:
   ```typescript
   // WRONG: birthDate.getMonth() returns 0-11
   Solar.fromYmdHms(year, month, day, ...)

   // CORRECT: lunar-javascript expects 1-12
   Solar.fromYmdHms(year, birthDate.getMonth() + 1, day, ...)
   ```

3. **Character database**: Always query via `lib/utils/data-loader.ts` functions, never load JSON directly. This provides consistent null handling.

4. **Testing**: When testing generators/scorers, use the scripts in `scripts/` directory. They provide formatted output and test multiple scenarios.

## What's NOT Implemented Yet

- Mobile responsive optimization (basic responsive done, not perfect)
- Export功能 (导出名字列表为PDF/图片)
- Batch name generation UI (can generate multiple names at once)

## Environment Variables Required

```env
# OpenAI API (for AI generator)
OPENAI_API_KEY=sk-xxx          # Required for AI generator
OPENAI_BASE_URL=https://...    # Optional, defaults to OpenAI
AI_MODEL=gpt-4o-mini            # Optional, defaults to gpt-4o-mini

# Database (Hybrid mode: local SQLite + Turso serverless)
# Local development (no config needed, uses SQLite automatically)
DATABASE_PATH=./data/names.db  # Optional, defaults to ./data/names.db

# Production (Vercel deployment with Turso)
TURSO_URL=libsql://your-db.turso.io     # Required for production
TURSO_AUTH_TOKEN=your-auth-token         # Required for production
```

Server runs on port 16666 by default (configured in `package.json` via next dev).

## Development Philosophy

This codebase follows pragmatic principles:
- **Data structure first**: Get the data model right, code becomes simple
- **No special cases**: Eliminate edge cases through better design
- **Real algorithms only**: No fake/placeholder scoring logic
- **Tool over manual work**: Auto-generate data (strokes, pinyin) instead of manual entry
