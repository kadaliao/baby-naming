'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { ScoreRadar } from './ScoreRadar';
import type { NameCandidate } from '@/types/name';

interface NameCardProps {
  name: NameCandidate & { id?: number; isFavorite?: boolean };
  index: number;
}

export function NameCard({ name, index }: NameCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(name.isFavorite || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const scoreDetail = name.scoreDetail;
  const total = scoreDetail?.total || name.score || 0;
  const grade = scoreDetail?.grade || 'C';

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (!name.id || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: name.id, action: 'toggle' }),
      });

      const result = await response.json();
      if (result.success) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('切换收藏失败：', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // 等级颜色
  const gradeColors: Record<string, string> = {
    S: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
    A: 'bg-gradient-to-r from-green-400 to-emerald-400 text-white',
    B: 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white',
    C: 'bg-gradient-to-r from-gray-400 to-slate-400 text-white',
    D: 'bg-gradient-to-r from-red-400 to-pink-400 text-white',
  };

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {name.fullName}
              </CardTitle>
            </div>
            <CardDescription className="mt-2">
              来源：{name.source === 'ai' ? 'AI 智能生成' : name.source}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* 收藏按钮 */}
            {name.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isTogglingFavorite}
                className={isFavorite ? 'text-yellow-500' : 'text-gray-400'}
              >
                <Star
                  className="h-5 w-5"
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              </Button>
            )}
            <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-2">
              <Badge className={`text-lg px-4 py-1 ${gradeColors[grade]}`}>
                {grade} 级
              </Badge>
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {total.toFixed(0)} 分
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 寓意说明（诗句来源特殊展示） */}
        {name.sourceDetail && (
          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
              {name.source === 'poetry' ? '诗词出处' : '寓意解析'}
            </h4>
            {name.source === 'poetry' ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  {name.sourceDetail}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {name.sourceDetail}
              </p>
            )}
          </div>
        )}

        {/* 评分雷达图（可折叠） */}
        {scoreDetail && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full justify-between"
            >
              <span className="text-sm font-semibold">
                {showDetails ? '收起' : '查看'}评分雷达图
              </span>
              <span className="text-xl">
                {showDetails ? '▲' : '▼'}
              </span>
            </Button>
            {showDetails && (
              <div className="mt-4">
                <ScoreRadar scoreDetail={scoreDetail} />
              </div>
            )}
          </div>
        )}

        {/* 评分详情（进度条） */}
        {scoreDetail && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-3 text-sm text-gray-700 dark:text-gray-300">
                评分详情
              </h4>
              <div className="space-y-3">
                {/* 五行评分 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      五行 ({scoreDetail.breakdown.wuxing.score}/25)
                    </span>
                    <span className="text-sm font-medium">
                      {scoreDetail.breakdown.wuxing.score.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={(scoreDetail.breakdown.wuxing.score / 25) * 100} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {scoreDetail.breakdown.wuxing.reason}
                  </p>
                </div>

                {/* 音律评分 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      音律 ({scoreDetail.breakdown.yinlu.score}/25)
                    </span>
                    <span className="text-sm font-medium">
                      {scoreDetail.breakdown.yinlu.score.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={(scoreDetail.breakdown.yinlu.score / 25) * 100} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {scoreDetail.breakdown.yinlu.reason}
                  </p>
                </div>

                {/* 字形评分 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      字形 ({scoreDetail.breakdown.zixing.score}/20)
                    </span>
                    <span className="text-sm font-medium">
                      {scoreDetail.breakdown.zixing.score.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={(scoreDetail.breakdown.zixing.score / 20) * 100} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {scoreDetail.breakdown.zixing.reason}
                  </p>
                </div>

                {/* 寓意评分 */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      寓意 ({scoreDetail.breakdown.yuyi.score}/30)
                    </span>
                    <span className="text-sm font-medium">
                      {scoreDetail.breakdown.yuyi.score.toFixed(0)}
                    </span>
                  </div>
                  <Progress value={(scoreDetail.breakdown.yuyi.score / 30) * 100} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {scoreDetail.breakdown.yuyi.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* 建议 */}
            {scoreDetail.suggestions && scoreDetail.suggestions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-300">
                    改进建议
                  </h4>
                  <ul className="space-y-1">
                    {scoreDetail.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
