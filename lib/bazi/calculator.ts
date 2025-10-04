/**
 * 八字和五行计算模块
 * "Talk is cheap. Show me the code." - Linus
 */

import { Solar, Lunar } from 'lunar-javascript';

/**
 * 八字信息
 */
export interface BaziInfo {
  /** 八字（年月日时四柱） */
  bazi: {
    year: string;   // 年柱：如"甲子"
    month: string;  // 月柱
    day: string;    // 日柱
    hour: string;   // 时柱
  };
  /** 五行统计 */
  wuxing: {
    金: number;
    木: number;
    水: number;
    火: number;
    土: number;
  };
  /** 缺少的五行 */
  lacking: string[];
  /** 推荐补益的五行 */
  needs: string[];
}

/**
 * 天干五行对照表
 */
const TIANGAN_WUXING: Record<string, string> = {
  '甲': '木',
  '乙': '木',
  '丙': '火',
  '丁': '火',
  '戊': '土',
  '己': '土',
  '庚': '金',
  '辛': '金',
  '壬': '水',
  '癸': '水',
};

/**
 * 地支五行对照表
 */
const DIZHI_WUXING: Record<string, string> = {
  '子': '水',
  '丑': '土',
  '寅': '木',
  '卯': '木',
  '辰': '土',
  '巳': '火',
  '午': '火',
  '未': '土',
  '申': '金',
  '酉': '金',
  '戌': '土',
  '亥': '水',
};

/**
 * 统计五行数量
 */
function countWuxing(bazi: string[]): Record<string, number> {
  const counts: Record<string, number> = {
    '金': 0,
    '木': 0,
    '水': 0,
    '火': 0,
    '土': 0,
  };

  for (const ganzhi of bazi) {
    if (ganzhi.length < 2) continue;

    const tiangan = ganzhi[0];
    const dizhi = ganzhi[1];

    const tianganWuxing = TIANGAN_WUXING[tiangan];
    const dizhiWuxing = DIZHI_WUXING[dizhi];

    if (tianganWuxing) counts[tianganWuxing]++;
    if (dizhiWuxing) counts[dizhiWuxing]++;
  }

  return counts;
}

/**
 * 计算八字和五行
 */
export function calculateBazi(birthDate: Date): BaziInfo {
  // 转换为阳历对象（年月日时分秒）
  const solar = Solar.fromYmdHms(
    birthDate.getFullYear(),
    birthDate.getMonth() + 1, // JS月份从0开始，lunar需要1-12
    birthDate.getDate(),
    birthDate.getHours(),
    birthDate.getMinutes(),
    birthDate.getSeconds()
  );

  // 获取阴历对象
  const lunar = solar.getLunar();

  // 四柱（直接从lunar对象获取）
  const year = lunar.getYearInGanZhi();
  const month = lunar.getMonthInGanZhi();
  const day = lunar.getDayInGanZhi();
  const hour = lunar.getTimeInGanZhi();

  // 统计五行
  const wuxingCounts = countWuxing([year, month, day, hour]);

  // 找出缺少的五行（数量为0）
  const lacking: string[] = [];
  for (const [element, count] of Object.entries(wuxingCounts)) {
    if (count === 0) {
      lacking.push(element);
    }
  }

  // 推荐补益的五行（缺少的 + 数量少的）
  const needs: string[] = [...lacking];

  // 如果没有缺的，找数量最少的1-2个
  if (needs.length === 0) {
    const sorted = Object.entries(wuxingCounts).sort((a, b) => a[1] - b[1]);
    needs.push(sorted[0][0]); // 最少的
    if (sorted[1][1] === sorted[0][1]) {
      needs.push(sorted[1][0]); // 同样少的
    }
  }

  return {
    bazi: {
      year,
      month,
      day,
      hour,
    },
    wuxing: wuxingCounts as BaziInfo['wuxing'],
    lacking,
    needs,
  };
}

/**
 * 格式化八字信息（用于显示）
 */
export function formatBazi(baziInfo: BaziInfo): string {
  const { bazi, wuxing, lacking, needs } = baziInfo;

  let result = `八字：${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}\n`;
  result += `五行：`;

  const wuxingStr = Object.entries(wuxing)
    .map(([element, count]) => `${element}${count}`)
    .join(' ');
  result += wuxingStr;

  if (lacking.length > 0) {
    result += `\n缺：${lacking.join('、')}`;
  }

  result += `\n建议补：${needs.join('、')}`;

  return result;
}
