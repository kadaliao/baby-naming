/**
 * POST /api/auth
 * 用户认证（注册或登录）
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerOrLogin, migrateSessionToUser } from '@/lib/auth/user';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, sessionId } = body;

    // 验证输入
    if (!username || username.length < 2) {
      return NextResponse.json(
        { error: '用户名至少需要2个字符' },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: '密码至少需要4个字符' },
        { status: 400 }
      );
    }

    // 注册或登录
    const user = await registerOrLogin(username, password);

    if (!user) {
      return NextResponse.json(
        { error: '用户名已存在，密码错误' },
        { status: 401 }
      );
    }

    // 如果提供了sessionId，迁移数据
    let migratedCount = 0;
    if (sessionId) {
      migratedCount = migrateSessionToUser(sessionId, user.id);
      console.log(`✅ 迁移了 ${migratedCount} 条记录从 session ${sessionId} 到 user ${user.id}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        migratedCount,
      },
    });
  } catch (error) {
    console.error('认证失败：', error);
    return NextResponse.json(
      { error: '认证失败，请稍后重试' },
      { status: 500 }
    );
  }
}
