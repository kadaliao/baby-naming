import { Card, CardContent } from '@/components/ui/card';
import { FileText, Star, TrendingUp, Sparkles } from 'lucide-react';

interface Stats {
  total: number;
  favorites: number;
  avgScore: number;
  bySources: Record<string, number>;
}

interface StatsCardProps {
  stats: Stats;
  className?: string;
}

export function StatsCard({ stats, className }: StatsCardProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 总数 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总记录数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 收藏数 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">收藏数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.favorites}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 平均分 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">平均分</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgScore}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 来源分布 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">来源分布</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.bySources).map(([source, count]) => {
                    const sourceLabels: Record<string, string> = {
                      poetry: '诗词',
                      wuxing: '五行',
                      ai: 'AI',
                    };
                    return (
                      <span
                        key={source}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
                      >
                        {sourceLabels[source] || source}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
