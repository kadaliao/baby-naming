import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, Trash2, Calendar, Award } from 'lucide-react';

interface HistoryRecord {
  id: number;
  fullName: string;
  firstName: string;
  surname: string;
  score: {
    total: number;
    grade: string;
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
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div className="flex gap-3 flex-1">
                {/* 复选框 */}
                {showCheckbox && (
                  <div className="pt-1">
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => onToggleSelect(record.id)}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {record.fullName}
                    </h3>
                    <Badge className={getSourceColor(record.source)}>
                      {getSourceText(record.source)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span className={`font-semibold ${getGradeColor(record.score.grade)}`}>
                        {record.score.grade}级
                      </span>
                      <span>·</span>
                      <span>{record.score.total}分</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(record.id)}
                  className={record.isFavorite ? 'text-yellow-500' : 'text-gray-400'}
                >
                  <Star
                    className="h-5 w-5"
                    fill={record.isFavorite ? 'currentColor' : 'none'}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(record.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {record.sourceDetail && (
            <CardContent className="pt-0">
              <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                {record.sourceDetail}
              </div>
              {record.notes && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                  备注：{record.notes}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
