'use client';

import { useState } from 'react';
import { NameInputForm } from '@/components/forms/NameInputForm';
import { NameCard } from '@/components/results/NameCard';
import type { NamingInput, NameCandidate } from '@/types/name';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<NameCandidate[]>([]);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (data: NamingInput) => {
    setIsGenerating(true);
    setError('');
    setResults([]);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            宝宝取名助手
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            结合传统文化与现代 AI，为您的宝宝推荐美好的名字
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
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
    </div>
  );
}
