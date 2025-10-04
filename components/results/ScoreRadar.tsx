'use client';

/**
 * 评分雷达图组件
 * "Perfection is achieved not when there is nothing more to add,
 *  but when there is nothing left to take away." - Not Linus, but true
 */

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ScoreResult } from '@/types/name';

interface ScoreRadarProps {
  scoreDetail: ScoreResult;
}

export function ScoreRadar({ scoreDetail }: ScoreRadarProps) {
  const { breakdown } = scoreDetail;

  // 将评分转换为百分比（满分100）
  const data = [
    {
      subject: '五行',
      score: breakdown.wuxing.score,
      fullMark: 25,
    },
    {
      subject: '音律',
      score: breakdown.yinlu.score,
      fullMark: 25,
    },
    {
      subject: '字形',
      score: breakdown.zixing.score,
      fullMark: 20,
    },
    {
      subject: '寓意',
      score: breakdown.yuyi.score,
      fullMark: 30,
    },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={90} domain={[0, 30]} />
          <Radar
            name="得分"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
