import { NextRequest, NextResponse } from 'next/server';
import { generateNamesWithAI } from '@/lib/generator/ai';
import { generateFromPoetry } from '@/lib/generator/poetry';
import { generateFromWuxing } from '@/lib/generator/wuxing';
import { comprehensiveScore } from '@/lib/scoring';
import { calculateBazi } from '@/lib/bazi/calculator';
import type { NamingInput, NameCandidate } from '@/types/name';

export const runtime = 'nodejs';

/**
 * POST /api/generate
 * 生成名字的 API 端点
 */
export async function POST(request: NextRequest) {
  try {
    const input: NamingInput = await request.json();

    // 验证输入
    if (!input.surname || input.surname.length === 0) {
      return NextResponse.json(
        { error: '请提供姓氏' },
        { status: 400 }
      );
    }

    if (!input.preferences || input.preferences.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一个寓意偏好' },
        { status: 400 }
      );
    }

    if (!input.sources || input.sources.length === 0) {
      return NextResponse.json(
        { error: '请至少选择一个名字来源' },
        { status: 400 }
      );
    }

    // 根据来源类型生成名字
    let candidates: NameCandidate[] = [];
    const perSourceCount = Math.ceil((input.count || 10) / input.sources.length);

    for (const source of input.sources) {
      if (source === 'ai') {
        const aiCandidates = await generateNamesWithAI(input);
        candidates.push(...aiCandidates.slice(0, perSourceCount));
      } else if (source === 'poetry') {
        const poetryCandidates = generateFromPoetry(
          input.surname,
          input.gender,
          undefined, // 暂不支持五行筛选
          perSourceCount
        );
        candidates.push(...poetryCandidates);
      } else if (source === 'wuxing') {
        // 优先使用八字计算五行需求
        let wuxingNeeds: string[];

        if (input.birthDate) {
          try {
            const baziInfo = calculateBazi(new Date(input.birthDate));
            wuxingNeeds = baziInfo.needs;
            console.log('八字计算结果：', baziInfo);
          } catch (error) {
            console.error('八字计算失败，使用偏好猜测：', error);
            wuxingNeeds = guessWuxingNeeds(input.preferences);
          }
        } else {
          // 没有出生日期，根据偏好猜测
          wuxingNeeds = guessWuxingNeeds(input.preferences);
        }

        const wuxingCandidates = generateFromWuxing(
          input.surname,
          wuxingNeeds,
          input.gender,
          perSourceCount
        );
        candidates.push(...wuxingCandidates);
      }
    }

    // 为每个名字计算评分
    const results: NameCandidate[] = await Promise.all(
      candidates.map(async (candidate) => {
        const scoreResult = await comprehensiveScore(
          candidate.fullName,
          candidate.firstName,
          input.preferences
        );

        return {
          ...candidate,
          score: scoreResult.total,
          scoreDetail: scoreResult,
        };
      })
    );

    // 按评分排序
    results.sort((a, b) => (b.score || 0) - (a.score || 0));

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('生成名字失败：', error);

    // 返回友好的错误信息
    const errorMessage = error instanceof Error ? error.message : '生成名字失败，请稍后重试';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 根据偏好猜测五行需求（临时方案）
 */
function guessWuxingNeeds(preferences: string[]): string[] {
  const wuxingMap: Record<string, string> = {
    '聪明智慧': '水',
    '品德高尚': '木',
    '事业有成': '金',
    '健康平安': '土',
    '活泼开朗': '火',
    '温柔善良': '木',
    '坚强勇敢': '金',
    '文艺才华': '水',
  };

  const needs = new Set<string>();
  for (const pref of preferences) {
    const wuxing = wuxingMap[pref];
    if (wuxing) {
      needs.add(wuxing);
    }
  }

  // 如果没有匹配，默认返回金水木
  return needs.size > 0 ? Array.from(needs) : ['金', '水', '木'];
}
