'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface User {
  id: number;
  username: string;
  created_at: string;
}

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, migratedCount: number) => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get current sessionId from localStorage
      const sessionId = localStorage.getItem('sessionId') || '';

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, sessionId }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || '登录失败');
        return;
      }

      // Store user info
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // Call success callback
      onSuccess(result.data.user, result.data.migratedCount);

      // Reset form
      setUsername('');
      setPassword('');
      onClose();
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-2">登录 / 注册</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          首次登录将自动注册账号，并迁移当前会话的历史记录
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="至少2个字符"
              minLength={2}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少4个字符"
              minLength={4}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录 / 注册'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          如用户名已存在但密码错误，将登录失败
        </p>
      </div>
    </div>
  );
}
