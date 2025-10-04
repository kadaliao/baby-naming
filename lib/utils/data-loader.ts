/**
 * 数据加载器 - 加载和查询汉字属性、诗词数据
 */

import wuxingData from '@/data/characters/wuxing.json';
import strokesData from '@/data/characters/strokes.json';
import pinyinData from '@/data/characters/pinyin.json';
import tangshiData from '@/data/poetry/tangshi.json';

// ============ 类型定义 ============

interface WuxingChar {
  char: string;
  wuxing: string;
}

interface StrokeChar {
  char: string;
  strokes: number;
}

interface PinyinChar {
  char: string;
  pinyin: string;
  pinyinNoTone: string;
  tone: number;
  shengmu: string;
  yunmu: string;
}

interface Poem {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  type: string;
}

// ============ 数据索引 ============

// 五行索引：字 -> 五行
const wuxingMap = new Map<string, string>();
wuxingData.characters.forEach((item: WuxingChar) => {
  wuxingMap.set(item.char, item.wuxing);
});

// 笔画索引：字 -> 笔画数
const strokesMap = new Map<string, number>();
strokesData.characters.forEach((item: StrokeChar) => {
  strokesMap.set(item.char, item.strokes);
});

// 拼音索引：字 -> 拼音信息
const pinyinMap = new Map<string, PinyinChar>();
pinyinData.characters.forEach((item: PinyinChar) => {
  pinyinMap.set(item.char, item);
});

// 诗词列表
const poems: Poem[] = tangshiData.poems;

// ============ 查询函数 ============

/**
 * 查询汉字的五行属性
 */
export function getCharWuxing(char: string): string | null {
  return wuxingMap.get(char) || null;
}

/**
 * 查询汉字的笔画数
 */
export function getCharStrokes(char: string): number | null {
  return strokesMap.get(char) || null;
}

/**
 * 查询汉字的拼音信息
 */
export function getCharPinyin(char: string): PinyinChar | null {
  return pinyinMap.get(char) || null;
}

/**
 * 查询汉字的声调
 */
export function getCharTone(char: string): number | null {
  const pinyin = pinyinMap.get(char);
  return pinyin ? pinyin.tone : null;
}

/**
 * 查询汉字的声母
 */
export function getCharShengmu(char: string): string | null {
  const pinyin = pinyinMap.get(char);
  return pinyin ? pinyin.shengmu : null;
}

/**
 * 查询汉字的韵母
 */
export function getCharYunmu(char: string): string | null {
  const pinyin = pinyinMap.get(char);
  return pinyin ? pinyin.yunmu : null;
}

/**
 * 获取所有诗词
 */
export function getAllPoems(): Poem[] {
  return poems;
}

/**
 * 根据关键字搜索诗词
 */
export function searchPoems(keyword: string): Poem[] {
  return poems.filter(
    (poem) =>
      poem.content.includes(keyword) ||
      poem.title.includes(keyword) ||
      poem.author.includes(keyword)
  );
}

/**
 * 根据作者查找诗词
 */
export function getPoemsByAuthor(author: string): Poem[] {
  return poems.filter((poem) => poem.author === author);
}

/**
 * 从诗句中提取包含指定字的诗词
 */
export function getPoemsContainingChar(char: string): Poem[] {
  return poems.filter((poem) => poem.content.includes(char));
}

/**
 * 获取数据统计
 */
export function getDataStats() {
  return {
    wuxingChars: wuxingMap.size,
    strokesChars: strokesMap.size,
    pinyinChars: pinyinMap.size,
    poems: poems.length,
  };
}
