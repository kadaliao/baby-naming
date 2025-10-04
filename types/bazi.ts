/**
 * 八字和五行相关的类型定义
 */

/** 五行元素 */
export type WuxingElement = '金' | '木' | '水' | '火' | '土';

/** 天干 */
export type Tiangan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/** 地支 */
export type Dizhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/** 八字柱 */
export interface BaziPillar {
  /** 天干 */
  tiangan: Tiangan;
  /** 地支 */
  dizhi: Dizhi;
}

/** 八字信息 */
export interface BaziInfo {
  /** 年柱 */
  year: BaziPillar;
  /** 月柱 */
  month: BaziPillar;
  /** 日柱 */
  day: BaziPillar;
  /** 时柱 */
  hour: BaziPillar;
  /** 五行统计 */
  wuxing: Record<WuxingElement, number>;
  /** 缺失的五行 */
  lacking: WuxingElement[];
  /** 喜用神 */
  favorable?: WuxingElement[];
}

/** 五行评分详情 */
export interface WuxingScoreDetail {
  /** 八字五行分布 */
  baziWuxing: Record<WuxingElement, number>;
  /** 名字五行 */
  nameWuxing: WuxingElement[];
  /** 缺失五行 */
  lacking: WuxingElement[];
  /** 平衡度 (0-1) */
  balance: number;
}

/** 汉字五行属性 */
export interface CharacterWuxing {
  /** 汉字 */
  char: string;
  /** 五行属性 */
  wuxing: WuxingElement;
  /** 笔画数 */
  strokes: number;
  /** 拼音 */
  pinyin: string;
  /** 声调 */
  tone: 1 | 2 | 3 | 4 | 5;
}
