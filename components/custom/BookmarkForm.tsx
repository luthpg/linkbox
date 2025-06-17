'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type Bookmark,
  type BookmarkFormData,
  BookmarkFormSchema,
} from '@/types/bookmark';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { type ControllerRenderProps, useForm } from 'react-hook-form';

interface BookmarkFormProps {
  initialData?: Bookmark;
  onSubmit: (data: BookmarkFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

/**
 * ブックマークの登録・編集用のフォームコンポーネント。
 * ZodスキーマとReact Hook Formを使用してバリデーションを行います。
 * @param initialData 初期データ（編集モードの場合にフォームにプリセットされます）
 * @param onSubmit フォーム送信時に呼び出されるコールバック
 * @param onCancel キャンセル時に呼び出されるコールバック
 * @param isLoading フォームの送信状態
 */
export function BookmarkForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: BookmarkFormProps) {
  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(BookmarkFormSchema),
    defaultValues: {
      url: '',
      title: '',
      memo: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        url: initialData.url,
        title: initialData.title,
        memo: initialData.memo || '',
        tags: initialData.tags || [],
      });
    } else {
      form.reset();
    }
  }, [initialData, form]);

  /**
   * タグ入力フィールドでEnterキーが押されたときのハンドラ。
   * 新しいタグを追加し、入力フィールドをクリアします。
   * @param e キーボードイベント
   * @param field React Hook Formのフィールドオブジェクト
   */
  const handleTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: ControllerRenderProps<BookmarkFormData, 'tags'>,
  ) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim().toLowerCase();
      const currentTags = field.value || [];

      if (!currentTags.includes(newTag)) {
        field.onChange([...currentTags, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  /**
   * 指定されたタグをリストから削除します。
   * @param tagToRemove 削除するタグの文字列
   * @param field React Hook Formのフィールドオブジェクト
   */
  const removeTag = (
    tagToRemove: string,
    field: ControllerRenderProps<BookmarkFormData, 'tags'>,
  ) => {
    field.value != null &&
      field.onChange(field.value.filter((tag: string) => tag !== tagToRemove));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? 'ブックマークを編集' : '新しいブックマークを追加'}
        </CardTitle>
        <CardDescription>
          {initialData
            ? 'ブックマークの情報を更新してください。'
            : '新しいウェブサイトのブックマークを追加してください。'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    URL <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    タイトル <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ウェブサイトのタイトル"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ (任意)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="このブックマークに関するメモ"
                      {...field}
                      value={field.value || ''}
                      className="w-full min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タグ (Enterで追加、複数可)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 flex-wrap">
                      {field.value?.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {tag}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                            onClick={() => removeTag(tag, field)}
                            aria-label={`Remove tag ${tag}`}
                          >
                            <XIcon className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}

                      <Input
                        type="text"
                        placeholder="タグを入力..."
                        onKeyDown={(e) => handleTagInputKeyDown(e, field)}
                        className="flex-grow min-w-[120px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root?.message && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.root.message}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '保存中...' : initialData ? '更新' : '保存'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
