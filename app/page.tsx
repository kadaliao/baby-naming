'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { NameInputForm } from '@/components/forms/NameInputForm';
import { NameCard } from '@/components/results/NameCard';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { History, LogIn, LogOut, User } from 'lucide-react';
import type { NamingInput, NameCandidate } from '@/types/name';

interface User {
  id: number;
  username: string;
  created_at: string;
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<NameCandidate[]>([]);
  const [error, setError] = useState<string>('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMessage, setAuthMessage] = useState<string>('');

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

  // 获取或生成session ID
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  // 处理登录成功
  const handleAuthSuccess = (user: User, migratedCount: number) => {
    setCurrentUser(user);
    setAuthMessage(
      migratedCount > 0
        ? `欢迎 ${user.username}！已成功迁移 ${migratedCount} 条历史记录`
        : `欢迎 ${user.username}！`
    );
    setTimeout(() => setAuthMessage(''), 5000);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthMessage('已退出登录');
    setTimeout(() => setAuthMessage(''), 3000);
  };

  const handleSubmit = async (data: NamingInput) => {
    setIsGenerating(true);
    setError('');
    setResults([]);

    try {
      const sessionId = getSessionId();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      };

      // 如果用户已登录，传递 userId
      if (currentUser) {
        headers['x-user-id'] = currentUser.id.toString();
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '生成名字失败');
      }

      if (result.success && result.data) {
        setResults(result.data);
        // 滚动到结果区域
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      console.error('生成名字失败：', error);
      setError(error instanceof Error ? error.message : '生成名字失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              宝宝取名助手
            </h1>
            <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
              <Link href="/history">
                <Button variant="outline" size="sm">
                  <History className="h-4 w-4 mr-2" />
                  历史记录
                </Button>
              </Link>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {currentUser.username}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    退出
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsAuthDialogOpen(true)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  登录
                </Button>
              )}
            </div>
          </div>
          <p className="text-center text-sm md:text-base text-gray-600 dark:text-gray-400">
            结合传统文化与现代 AI，为您的宝宝推荐美好的名字
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Auth Success Message */}
        {authMessage && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-600 dark:text-green-400 text-sm">{authMessage}</p>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">开始取名</h2>
            <p className="text-gray-600 dark:text-gray-400">
              填写以下信息，我们将为您生成专业的名字推荐
            </p>
          </div>

          <NameInputForm onSubmit={handleSubmit} isLoading={isGenerating} />

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">正在生成名字，请稍候...</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                AI 正在结合诗词典故、五行八字为您精心挑选名字
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!isGenerating && results.length > 0 && (
          <div id="results" className="mt-8 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">推荐结果</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  共 {results.length} 个推荐
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                以下是根据您的要求精心挑选的名字，点击查看详细评分和寓意解析
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {results.map((name, index) => (
                <NameCard key={index} name={name} index={index} />
              ))}
            </div>

            {/* 重新生成按钮 */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setResults([]);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                重新生成名字
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>宝宝取名助手 © 2025</p>
          <p className="mt-2">结合诗词、五行、AI 智能生成，为您的宝宝推荐美好名字</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
