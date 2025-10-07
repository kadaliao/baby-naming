import { openai, DEFAULT_MODEL, NAMING_SYSTEM_PROMPT, buildNamingPrompt } from '../ai/openai';
import type { NameCandidate, NamingInput } from '@/types/name';

/**
 * AI 返回的名字数据结构
 */
interface AINameResult {
  firstName: string;
  fullName: string;
  meaning: string;
  source: string;
  confidence: number;
  tags: string[];
}

/**
 * 使用 AI 生成名字
 */
export async function generateNamesWithAI(input: NamingInput): Promise<NameCandidate[]> {
  try {
    const prompt = buildNamingPrompt({
      surname: input.surname,
      gender: input.gender,
      preferences: input.preferences,
      sources: input.sources,
      count: input.count || 10,
      fixedChar: input.fixedChar,
    });

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: NAMING_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    const result = JSON.parse(content) as { names: AINameResult[] };

    // 转换为 NameCandidate 格式
    const candidates: NameCandidate[] = result.names.map((name) => ({
      fullName: name.fullName,
      firstName: name.firstName,
      source: 'ai',
      sourceDetail: `${name.meaning}\n\n来源：${name.source}\n\n标签：${name.tags.join('、')}`,
      score: name.confidence,
    }));

    return candidates;
  } catch (error) {
    console.error('AI 生成名字失败：', error);
    throw new Error('AI 生成名字失败，请稍后重试');
  }
}
