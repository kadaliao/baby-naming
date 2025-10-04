/**
 * 诗词相关的类型定义
 */

/** 朝代 */
export type Dynasty = '先秦' | '秦' | '汉' | '魏晋' | '南北朝' | '隋' | '唐' | '五代' | '宋' | '元' | '明' | '清' | '近现代';

/** 诗词类型 */
export type PoetryType = '诗' | '词' | '曲' | '赋' | '散文';

/** 诗词风格 */
export type PoetryStyle = '豪放' | '婉约' | '田园' | '边塞' | '咏物' | '咏史' | '山水' | '离别' | '思乡';

/** 诗词信息 */
export interface Poetry {
  /** ID */
  id?: number;
  /** 标题 */
  title: string;
  /** 作者 */
  author: string;
  /** 朝代 */
  dynasty: Dynasty;
  /** 内容 */
  content: string;
  /** 类型 */
  type: PoetryType;
  /** 风格 */
  style?: PoetryStyle[];
  /** 标签 */
  tags?: string[];
  /** 翻译 */
  translation?: string;
  /** 注释 */
  annotation?: string;
}

/** 诗词筛选条件 */
export interface PoetryFilter {
  /** 朝代 */
  dynasty?: Dynasty[];
  /** 类型 */
  type?: PoetryType[];
  /** 风格 */
  style?: PoetryStyle[];
  /** 作者 */
  author?: string[];
  /** 关键词 */
  keywords?: string[];
  /** 性别适合度 */
  gender?: 'male' | 'female' | 'neutral';
}
