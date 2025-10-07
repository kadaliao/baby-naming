'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryList } from '@/components/history/HistoryList';
import { StatsCard } from '@/components/history/StatsCard';
import { Loader2, Home } from 'lucide-react';

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

  // 获取session ID
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // 加载历史记录
  const loadHistory = async (onlyFavorites = false) => {
    try {
      const sessionId = getSessionId();
      const params = new URLSearchParams({
        sessionId,
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
      setIsLoading(false);
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
        // 重新加载数据
        await Promise.all([loadHistory(false), loadHistory(true)]);
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
        // 重新加载数据
        await Promise.all([loadHistory(false), loadHistory(true)]);
      }
    } catch (error) {
      console.error('删除记录失败：', error);
    }
  };

  useEffect(() => {
    loadHistory(false);
    loadHistory(true);
  }, []);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">历史记录</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">查看所有生成的名字</p>
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">全部记录 ({stats?.total || 0})</TabsTrigger>
            <TabsTrigger value="favorites">收藏夹 ({stats?.favorites || 0})</TabsTrigger>
          </TabsList>

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
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
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
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
