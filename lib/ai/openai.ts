import OpenAI from 'openai';

// 创建 OpenAI 客户端
export const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

// 默认模型
export const DEFAULT_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';

// 系统提示词
export const NAMING_SYSTEM_PROMPT = `你是一位经验丰富的起名大师，精通：
1. 中国传统文化、诗词典故
2. 五行八字理论
3. 汉字音韵、字形美学
4. 现代审美和流行趋势

你的任务是为宝宝推荐优质的名字，每个名字都要：
- 寓意美好、积极向上
- 音韵和谐、朗朗上口
- 字形优美、易读易写
- 符合用户的偏好要求

请以 JSON 格式返回结果。`;

/**
 * 构建取名提示词
 */
export function buildNamingPrompt(params: {
  surname: string;
  gender: string;
  preferences: string[];
  sources: string[];
  count?: number;
  fixedChar?: { char: string; position: 'first' | 'second' };
}): string {
  const genderText =
    params.gender === 'male' ? '男' :
    params.gender === 'female' ? '女' :
    '';
  const count = params.count || 10;

  let sourceInstructions = '';
  if (params.sources.includes('poetry')) {
    sourceInstructions += '\n- 从唐诗宋词、诗经楚辞等古典诗词中提取优美的字词';
  }
  if (params.sources.includes('wuxing')) {
    sourceInstructions += '\n- 考虑五行平衡，选择五行属性合适的字';
  }
  if (params.sources.includes('ai')) {
    sourceInstructions += '\n- 发挥创意，结合现代审美设计新颖的名字';
  }
  if (params.sources.includes('custom')) {
    sourceInstructions += '\n- 综合多种来源，推荐最优质的名字';
  }

  let fixedCharInstructions = '';
  if (params.fixedChar) {
    const position = params.fixedChar.position === 'first' ? '第一个字' : '第二个字';
    fixedCharInstructions = `\n\n⚠️ 固定字要求：名字的${position}必须是"${params.fixedChar.char}"，请只生成另一个字来搭配。`;
  }

  return `请为姓"${params.surname}"的${genderText}宝宝推荐${count}个名字。

用户偏好：${params.preferences.join('、')}

名字来源要求：${sourceInstructions}${fixedCharInstructions}

请返回 JSON 格式：
{
  "names": [
    {
      "firstName": "诗涵",
      "fullName": "${params.surname}诗涵",
      "meaning": "诗意涵养，温文尔雅，寓意孩子富有文学气质和内在修养",
      "source": "取自诗词'腹有诗书气自华'，涵字体现涵养",
      "confidence": 95,
      "tags": ["诗意", "文雅", "内涵"]
    }
  ]
}

要求：
1. 每个名字必须提供详细的寓意解释
2. 如果来源诗词，请注明具体诗句和作者
3. confidence 表示推荐度 (0-100)
4. tags 标签要准确反映名字特点
5. 名字要符合中国人起名习惯，避免生僻字
6. 注意音韵和谐，避免谐音不雅`;
}
