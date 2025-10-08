/**
 * POST /api/favorite
 * 切换收藏状态或添加备注
 */

import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite, addNote, deleteName } from '@/lib/db/repository';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, note } = body;

    if (!id || typeof id !== 'number') {
      return NextResponse.json(
        { error: '缺少有效的记录ID' },
        { status: 400 }
      );
    }

    let success = false;
    let message = '';

    switch (action) {
      case 'toggle':
        success = await toggleFavorite(id);
        message = success ? '收藏状态已更新' : '更新失败';
        break;

      case 'note':
        if (typeof note !== 'string') {
          return NextResponse.json(
            { error: '备注内容无效' },
            { status: 400 }
          );
        }
        success = await addNote(id, note);
        message = success ? '备注已保存' : '保存失败';
        break;

      case 'delete':
        success = await deleteName(id);
        message = success ? '记录已删除' : '删除失败';
        break;

      default:
        return NextResponse.json(
          { error: '无效的操作类型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success,
      message,
    });
  } catch (error) {
    console.error('操作失败：', error);
    return NextResponse.json(
      { error: '操作失败' },
      { status: 500 }
    );
  }
}
