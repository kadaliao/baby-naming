/**
 * 名字相关的类型定义
 */

/** 性别 */
export type Gender = 'male' | 'female' | 'neutral';

/** 名字来源 */
export type NameSource = 'poetry' | 'wuxing' | 'ai' | 'custom';

/** 名字候选项 */
export interface NameCandidate {
  /** 全名 */
  fullName: string;
  /** 名字（不含姓氏） */
  firstName: string;
  /** 来源 */
  source: NameSource;
  /** 来源详情（诗句、算法说明等） */
  sourceDetail?: string;
  /** 评分 */
  score?: number;
  /** 评分详情 */
  scoreDetail?: ScoreResult;
  /** 是否收藏 */
  isFavorite?: boolean;
  /** 创建时间 */
  createdAt?: Date;
}

/** 取名输入参数 */
export interface NamingInput {
  /** 姓氏 */
  surname: string;
  /** 性别 */
  gender: Gender;
  /** 出生日期时间 */
  birthDate?: Date;
  /** 用户偏好 */
  preferences: string[];
  /** 名字来源选择 */
  sources: NameSource[];
  /** 生成数量 */
  count?: number;
  /** 固定字（辈分字） */
  fixedChar?: {
    /** 辈分字（单个汉字） */
    char: string;
    /** 位置（姓氏后第一个字或第二个字） */
    position: 'first' | 'second';
  };
}

/** 评分结果 */
export interface ScoreResult {
  /** 总分 */
  total: number;
  /** 分项评分 */
  breakdown: {
    wuxing: ScoreDetail;
    yinlu: ScoreDetail;
    zixing: ScoreDetail;
    yuyi: ScoreDetail;
  };
  /** 等级 */
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  /** 改进建议 */
  suggestions: string[];
}

/** 评分详情 */
export interface ScoreDetail {
  /** 得分 */
  score: number;
  /** 理由 */
  reason: string;
  /** 详细数据 */
  details?: Record<string, any>;
}
