/**
 * GET /api/history
 * 获取历史记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHistory, getStats } from '@/lib/db/repository';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 获取session ID
    const sessionId =
      request.cookies.get('sessionId')?.value ||
      request.headers.get('x-session-id') ||
      searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少session ID' },
        { status: 400 }
      );
    }

    // 获取查询参数
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const onlyFavorites = searchParams.get('favorites') === 'true';

    // 查询历史记录
    const history = getHistory(sessionId, {
      limit,
      offset,
      onlyFavorites,
    });

    // 解析JSON字段
    const results = history.map((record) => ({
      id: record.id,
      surname: record.surname,
      fullName: record.full_name,
      firstName: record.first_name,
      gender: record.gender,
      birthDate: record.birth_date,
      preferences: record.preferences ? JSON.parse(record.preferences) : [],
      sources: record.sources ? JSON.parse(record.sources) : [],
      fixedChar: record.fixed_char
        ? { char: record.fixed_char, position: record.fixed_position }
        : undefined,
      score: {
        total: record.score_total,
        grade: record.grade,
        breakdown: record.score_breakdown
          ? JSON.parse(record.score_breakdown)
          : undefined,
      },
      source: record.source,
      sourceDetail: record.source_detail,
      isFavorite: record.is_favorite === 1,
      notes: record.notes,
      createdAt: record.created_at,
    }));

    // 获取统计信息
    const stats = getStats(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        records: results,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.total,
        },
      },
    });
  } catch (error) {
    console.error('获取历史记录失败：', error);
    return NextResponse.json(
      { error: '获取历史记录失败' },
      { status: 500 }
    );
  }
}
