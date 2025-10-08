'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryList } from '@/components/history/HistoryList';
import { StatsCard } from '@/components/history/StatsCard';
import { Loader2, Home, User as UserIcon, Trash2 } from 'lucide-react';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface HistoryRecord {
  id: number;
  fullName: string;
  firstName: string;
  surname: string;
  gender?: string;
  birthDate?: string;
  preferences: string[];
  sources: string[];
  fixedChar?: { char: string; position: string };
  score: {
    total: number;
    grade: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    breakdown?: any;
  };
  source: string;
  sourceDetail?: string;
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  favorites: number;
  avgScore: number;
  bySources: Record<string, number>;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [favorites, setFavorites] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 初始化：检查是否已登录
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
  }, []);

  // 获取session ID
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // 加载历史记录 - 不使用 useCallback 避免闭包问题
  const loadHistory = async (onlyFavorites = false, initialLoad = false) => {
    try {
      // 每次调用时获取最新的 user 和 sessionId
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const params = new URLSearchParams({
        ...(user ? { userId: user.id.toString() } : { sessionId: getSessionId() }),
        ...(onlyFavorites ? { favorites: 'true' } : {}),
      });

      const response = await fetch(`/api/history?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '获取历史记录失败');
      }

      if (result.success) {
        if (onlyFavorites) {
          setFavorites(result.data.records);
        } else {
          setRecords(result.data.records);
          setStats(result.data.stats);
        }
      }
    } catch (error) {
      console.error('获取历史记录失败：', error);
      setError(error instanceof Error ? error.message : '获取历史记录失败');
    } finally {
      // 只在初始加载时设置isLoading
      if (initialLoad) {
        setIsLoading(false);
      }
    }
  };

  // 切换收藏
  const handleToggleFavorite = async (id: number) => {
    try {
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' }),
      });

      const result = await response.json();

      if (result.success) {
        // 重新加载数据（不显示loading）
        await Promise.all([loadHistory(false, false), loadHistory(true, false)]);
      }
    } catch (error) {
      console.error('切换收藏失败：', error);
    }
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'delete' }),
      });

      const result = await response.json();

      if (result.success) {
        // 重新加载数据（不显示loading）
        await Promise.all([loadHistory(false, false), loadHistory(true, false)]);
      }
    } catch (error) {
      console.error('删除记录失败：', error);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      alert('请先选择要删除的记录');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条记录吗？`)) {
      return;
    }

    try {
      // 并行删除所有选中的记录
      const deletePromises = selectedIds.map(id =>
        fetch('/api/favorite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'delete' }),
        })
      );

      const responses = await Promise.all(deletePromises);
      const results = await Promise.all(responses.map(r => r.json()));

      const successCount = results.filter(r => r.success).length;

      if (successCount > 0) {
        // 清空选中状态
        setSelectedIds([]);
        // 重新加载数据
        await Promise.all([loadHistory(false, false), loadHistory(true, false)]);
      }

      if (successCount < selectedIds.length) {
        alert(`删除完成：成功 ${successCount} 条，失败 ${selectedIds.length - successCount} 条`);
      }
    } catch (error) {
      console.error('批量删除失败：', error);
      alert('批量删除失败，请重试');
    }
  };

  // 切换选中状态
  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // 全选/取消全选
  const handleToggleSelectAll = () => {
    if (selectedIds.length === records.length && records.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  useEffect(() => {
    // 当用户状态加载完成后再加载历史记录（初始加载）
    loadHistory(false, true);
    loadHistory(true, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // 依赖currentUser，当用户登录/登出时重新加载

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">加载失败</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">历史记录</h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                {currentUser ? (
                  <span className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {currentUser.username} 的名字记录
                  </span>
                ) : (
                  '查看所有生成的名字'
                )}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        {stats && <StatsCard stats={stats} className="mb-8" />}

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="grid w-full sm:w-auto sm:max-w-md grid-cols-2">
              <TabsTrigger value="all">全部记录 ({stats?.total || 0})</TabsTrigger>
              <TabsTrigger value="favorites">收藏夹 ({stats?.favorites || 0})</TabsTrigger>
            </TabsList>

            {/* 批量操作按钮 */}
            {records.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleSelectAll}
                  className="flex-1 sm:flex-none"
                >
                  {selectedIds.length === records.length && records.length > 0 ? '取消全选' : '全选'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={selectedIds.length === 0}
                  className="flex-1 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  批量删除 {selectedIds.length > 0 && `(${selectedIds.length})`}
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="all" className="space-y-4">
            {records.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">还没有生成任何名字</p>
                  <Link href="/">
                    <Button className="mt-4">去生成名字</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <HistoryList
                records={records}
                selectedIds={selectedIds}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onToggleSelect={handleToggleSelect}
              />
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">还没有收藏任何名字</p>
                  <p className="text-sm text-gray-400 mt-2">点击名字卡片上的星标可以添加收藏</p>
                </CardContent>
              </Card>
            ) : (
              <HistoryList
                records={favorites}
                selectedIds={[]}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
                onToggleSelect={() => {}}
                showCheckbox={false}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
