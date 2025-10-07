'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { NamingInput, Gender, NameSource } from '@/types/name';

// 表单验证模式
const formSchema = z.object({
  surname: z.string().min(1, '请输入姓氏').max(2, '姓氏最多2个字'),
  fixedChar: z.string().max(1, '辈分字只能是1个汉字').optional(),
  fixedCharPosition: z.enum(['first', 'second'] as const).optional(),
  gender: z.enum(['male', 'female', 'neutral'] as const),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  preferences: z.array(z.string()).min(1, '请至少选择一个寓意偏好'),
  sources: z.array(z.string()).min(1, '请至少选择一个名字来源'),
});

type FormValues = z.infer<typeof formSchema>;

// 寓意选项
const PREFERENCE_OPTIONS = [
  { id: '聪明智慧', label: '聪明智慧', description: '智慧、聪颖、博学' },
  { id: '品德高尚', label: '品德高尚', description: '善良、仁义、正直' },
  { id: '健康平安', label: '健康平安', description: '平安、健康、长寿' },
  { id: '事业成功', label: '事业成功', description: '成就、昌盛、富贵' },
  { id: '文雅诗意', label: '文雅诗意', description: '文雅、诗意、有内涵' },
  { id: '活泼开朗', label: '活泼开朗', description: '阳光、乐观、开朗' },
  { id: '勇敢坚强', label: '勇敢坚强', description: '勇敢、坚毅、刚强' },
];

// 来源选项
const SOURCE_OPTIONS = [
  { id: 'poetry', label: '诗词典故', description: '从古诗词中提取优美字词' },
  { id: 'wuxing', label: '五行八字', description: '根据生辰八字五行推荐' },
  { id: 'ai', label: 'AI 智能', description: '使用 AI 创意生成名字' },
  { id: 'custom', label: '综合推荐', description: '结合多种来源综合推荐' },
];

interface NameInputFormProps {
  onSubmit: (data: NamingInput) => void;
  isLoading?: boolean;
}

export function NameInputForm({ onSubmit, isLoading = false }: NameInputFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surname: '',
      fixedChar: '',
      fixedCharPosition: 'first',
      gender: 'neutral',
      birthDate: '',
      birthTime: '',
      preferences: [],
      sources: [],
    },
  });

  const handleSubmit = (values: FormValues) => {
    // 组合日期和时间
    let birthDate: Date | undefined;
    if (values.birthDate) {
      const dateTimeStr = values.birthTime
        ? `${values.birthDate}T${values.birthTime}`
        : `${values.birthDate}T00:00`;
      birthDate = new Date(dateTimeStr);
    }

    // 组装固定字
    let fixedChar: { char: string; position: 'first' | 'second' } | undefined;
    if (values.fixedChar && values.fixedChar.trim().length > 0) {
      fixedChar = {
        char: values.fixedChar.trim(),
        position: values.fixedCharPosition || 'first',
      };
    }

    const namingInput: NamingInput = {
      surname: values.surname,
      gender: values.gender,
      birthDate,
      preferences: values.preferences,
      sources: values.sources as NameSource[],
      count: 10,
      fixedChar,
    };

    onSubmit(namingInput);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* 姓氏输入 */}
        <FormField
          control={form.control}
          name="surname"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">宝宝姓氏 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="请输入姓氏，如：张、李、王"
                  className="text-lg"
                  {...field}
                />
              </FormControl>
              <FormDescription>请输入宝宝的姓氏（1-2个字）</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 固定字（辈分字）*/}
        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <FormLabel className="text-base">辈分字（可选）</FormLabel>
          <FormDescription className="mb-4">
            如果家族有辈分字要求，可以指定固定的字和位置
          </FormDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fixedChar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>固定字</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="如：明、国、家"
                      maxLength={1}
                      className="text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">只能输入1个汉字</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fixedCharPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>位置</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="first" id="position-first" />
                        <Label htmlFor="position-first" className="cursor-pointer">
                          第一个字
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="second" id="position-second" />
                        <Label htmlFor="position-second" className="cursor-pointer">
                          第二个字
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription className="text-xs">
                    固定字在姓氏后的位置
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* 性别选择 */}
        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">宝宝性别 *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">
                      男孩
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">
                      女孩
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neutral" id="neutral" />
                    <Label htmlFor="neutral" className="cursor-pointer">
                      不限
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>选择宝宝的性别，有助于推荐更合适的名字</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 出生日期时间 */}
        <div className="space-y-4">
          <FormLabel className="text-base">出生日期时间（可选）</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormDescription>
            提供出生日期时间，可以进行五行八字分析（用于五行评分）
          </FormDescription>
        </div>

        {/* 寓意偏好 */}
        <FormField
          control={form.control}
          name="preferences"
          render={() => (
            <FormItem>
              <FormLabel className="text-base">寓意偏好 *</FormLabel>
              <FormDescription className="mb-4">
                选择您希望名字体现的寓意（可多选）
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREFERENCE_OPTIONS.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== option.id)
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium cursor-pointer">
                            {option.label}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {option.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 名字来源 */}
        <FormField
          control={form.control}
          name="sources"
          render={() => (
            <FormItem>
              <FormLabel className="text-base">名字来源 *</FormLabel>
              <FormDescription className="mb-4">
                选择名字的生成方式（可多选）
              </FormDescription>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SOURCE_OPTIONS.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name="sources"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.id])
                                : field.onChange(
                                    field.value?.filter((value) => value !== option.id)
                                  );
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium cursor-pointer">
                            {option.label}
                          </FormLabel>
                          <FormDescription className="text-xs">
                            {option.description}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 提交按钮 */}
        <div className="flex justify-center pt-4">
          <Button type="submit" size="lg" disabled={isLoading} className="min-w-[200px]">
            {isLoading ? '生成中...' : '开始生成名字'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
