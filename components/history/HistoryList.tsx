import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Star, Trash2, Calendar, Award } from 'lucide-react';
import { ScoreRadar } from '@/components/results/ScoreRadar';

interface HistoryRecord {
  id: number;
  fullName: string;
  firstName: string;
  surname: string;
  score: {
    total: number;
    grade: string;
    breakdown?: {
      wuxing: { score: number; reason: string };
      yinlu: { score: number; reason: string };
      zixing: { score: number; reason: string };
      yuyi: { score: number; reason: string };
    };
  };
  source: string;
  sourceDetail?: string;
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

interface HistoryListProps {
  records: HistoryRecord[];
  selectedIds: number[];
  onToggleFavorite: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleSelect: (id: number) => void;
  showCheckbox?: boolean;
}

export function HistoryList({
  records,
  selectedIds,
  onToggleFavorite,
  onDelete,
  onToggleSelect,
  showCheckbox = true
}: HistoryListProps) {
  // 管理每个卡片的展开状态
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 格式化时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '今天';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  // 获取来源标签颜色
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'poetry':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'wuxing':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'ai':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // 获取来源标签文本
  const getSourceText = (source: string) => {
    switch (source) {
      case 'poetry':
        return '诗词';
      case 'wuxing':
        return '五行';
      case 'ai':
        return 'AI';
      default:
        return source;
    }
  };

  // 获取评分等级颜色
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S':
        return 'text-red-600 dark:text-red-400';
      case 'A':
        return 'text-orange-600 dark:text-orange-400';
      case 'B':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'C':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {records.map((record) => {
        const isExpanded = expandedIds.has(record.id);
        const scoreDetail = record.score.breakdown;

        return (
        <Card key={record.id} className="hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 flex-1 min-w-0">
                {/* 复选框 */}
                {showCheckbox && (
                  <div className="pt-1 flex-shrink-0">
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => onToggleSelect(record.id)}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {record.fullName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge className={getSourceColor(record.source)} variant="secondary">
                      {getSourceText(record.source)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      <span className={`font-semibold ${getGradeColor(record.score.grade)}`}>
                        {record.score.grade}
                      </span>
                      <span className="text-gray-400">·</span>
                      <span>{record.score.total.toFixed(0)}分</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(record.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${record.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                  onClick={() => onToggleFavorite(record.id)}
                >
                  <Star
                    className="h-4 w-4"
                    fill={record.isFavorite ? 'currentColor' : 'none'}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  onClick={() => onDelete(record.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0 pb-3 flex-1 flex flex-col space-y-2">
            {/* 寓意说明 */}
            {record.sourceDetail && (
              <div>
                <h4 className="font-semibold mb-1 text-xs text-gray-700 dark:text-gray-300">
                  {record.source === 'poetry' ? '诗词出处' : '寓意解析'}
                </h4>
                {record.source === 'poetry' ? (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-md p-2 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic line-clamp-2">
                      {record.sourceDetail}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {record.sourceDetail}
                  </p>
                )}
              </div>
            )}

            {/* 展开/收起按钮 */}
            {scoreDetail && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(record.id)}
                className="w-full justify-between h-7 text-xs"
              >
                <span>{isExpanded ? '收起' : '查看'}评分详情</span>
                <span className="text-sm">{isExpanded ? '▲' : '▼'}</span>
              </Button>
            )}

            {/* 评分详情（展开后显示） */}
            {isExpanded && scoreDetail && (
              <>
                {/* 雷达图 */}
                <div className="mt-2">
                  <ScoreRadar scoreDetail={{
                    total: record.score.total,
                    grade: record.score.grade as 'S' | 'A' | 'B' | 'C' | 'D',
                    breakdown: scoreDetail,
                    suggestions: []
                  }} />
                </div>

                <Separator />

                {/* 四维评分进度条 */}
                <div className="space-y-2">
                  {/* 五行 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        五行 ({scoreDetail.wuxing.score.toFixed(0)}/25)
                      </span>
                    </div>
                    <Progress value={(scoreDetail.wuxing.score / 25) * 100} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {scoreDetail.wuxing.reason}
                    </p>
                  </div>

                  {/* 音律 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        音律 ({scoreDetail.yinlu.score.toFixed(0)}/25)
                      </span>
                    </div>
                    <Progress value={(scoreDetail.yinlu.score / 25) * 100} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {scoreDetail.yinlu.reason}
                    </p>
                  </div>

                  {/* 字形 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        字形 ({scoreDetail.zixing.score.toFixed(0)}/20)
                      </span>
                    </div>
                    <Progress value={(scoreDetail.zixing.score / 20) * 100} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {scoreDetail.zixing.reason}
                    </p>
                  </div>

                  {/* 寓意 */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        寓意 ({scoreDetail.yuyi.score.toFixed(0)}/30)
                      </span>
                    </div>
                    <Progress value={(scoreDetail.yuyi.score / 30) * 100} className="h-1.5" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                      {scoreDetail.yuyi.reason}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* 备注 */}
            {record.notes && (
              <div className="text-xs text-gray-600 dark:text-gray-400 italic pt-1 border-t dark:border-gray-700">
                备注：{record.notes}
              </div>
            )}
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
