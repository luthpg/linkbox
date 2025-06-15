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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type Bookmark,
  type BookmarkFormData,
  BookmarkFormSchema,
} from '@/types/bookmark'; // Zodスキーマと型をインポート
import { XIcon } from 'lucide-react';
import { useEffect } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface BookmarkFormProps {
  initialData?: Bookmark; // 編集時にフォームに初期設定するBookmarkオブジェクト (オプション)
  onSubmit: (data: BookmarkFormData) => void; // フォームが送信されたときに呼び出される関数（バリデーション済みデータ）
  onCancel: () => void; // キャンセルボタンがクリックされたときに呼び出される関数
  isLoading: boolean; // フォームの送信中を示すブール値 (保存ボタンの制御など)
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
  // useFormフックを初期化し、Zodスキーマをリゾルバとして設定します。
  // defaultValuesはフォームが初めてレンダリングされる際の初期値を定義します。
  const form = useForm<BookmarkFormData>({
    resolver: zodResolver(BookmarkFormSchema), // Zodスキーマでバリデーション
    defaultValues: {
      url: '',
      title: '',
      memo: '',
      tags: [],
    },
  });

  // `initialData` が変更されたときにフォームの値をリセットまたは設定します。
  // これにより、編集モードと新規作成モードの切り替えや、異なるブックマークを編集する際のフォームの状態を管理します。
  useEffect(() => {
    if (initialData) {
      // initialDataがある場合、フォームにその値を設定します。
      // memoがnullの場合に空文字列に変換して、フォームの入力フィールドが制御コンポーネントとして正しく機能するようにします。
      form.reset({
        url: initialData.url,
        title: initialData.title,
        memo: initialData.memo || '',
        tags: initialData.tags || [],
      });
    } else {
      // initialDataがない場合（新規作成モード）、フォームをクリアします。
      form.reset();
    }
  }, [initialData, form]); // initialDataまたはformインスタンスの変更時にエフェクトを再実行

  /**
   * タグ入力フィールドでEnterキーが押されたときのハンドラ。
   * 新しいタグを追加し、入力フィールドをクリアします。
   * @param e キーボードイベント
   * @param field React Hook Formのフィールドオブジェクト
   */
  const handleTagInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: any,
  ) => {
    // Enterキーが押され、かつ入力値が空白でない場合
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      e.preventDefault(); // Enterキーによるフォーム全体の送信を防止
      const newTag = e.currentTarget.value.trim().toLowerCase(); // 入力値をトリムして小文字に変換
      const currentTags = field.value || []; // 現在のタグリストを取得 (undefined/nullの場合は空配列)

      // 新しいタグが既存のタグリストに含まれていない場合のみ追加
      if (!currentTags.includes(newTag)) {
        field.onChange([...currentTags, newTag]); // React Hook FormのonChangeを使ってタグリストを更新
      }
      e.currentTarget.value = ''; // 入力フィールドをクリア
    }
  };

  /**
   * 指定されたタグをリストから削除します。
   * @param tagToRemove 削除するタグの文字列
   * @param field React Hook Formのフィールドオブジェクト
   */
  const removeTag = (tagToRemove: string, field: any) => {
    // 削除対象のタグを除外した新しいタグリストで更新
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
        {/* FormProviderの機能を提供するFormコンポーネントでフォームをラップ */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* URLフィールド */}
            <FormField
              control={form.control} // フォームの制御オブジェクト
              name="url" // フィールド名
              render={(
                { field }, // フィールドのレンダリング関数
              ) => (
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
                  <FormMessage /> {/* バリデーションエラーメッセージを表示 */}
                </FormItem>
              )}
            />

            {/* タイトルフィールド */}
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

            {/* メモフィールド */}
            <FormField
              control={form.control}
              name="memo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>メモ (任意)</FormLabel>
                  <FormControl>
                    {/* `field.value`がnullになる可能性があるので、空文字列に変換してControlled Componentにする */}
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

            {/* タグフィールド */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タグ (Enterで追加、複数可)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 現在のタグリストを表示し、削除ボタンを各タグに付ける */}
                      {field.value &&
                        field.value.map((tag: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {tag}
                            <Button
                              type="button" // フォーム送信を防ぐ
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                              onClick={() => removeTag(tag, field)} // タグ削除ハンドラを呼び出し
                              aria-label={`Remove tag ${tag}`}
                            >
                              <XIcon className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      {/* 新しいタグを入力するためのインプットフィールド */}
                      <Input
                        type="text"
                        placeholder="タグを入力..."
                        onKeyDown={(e) => handleTagInputKeyDown(e, field)} // Enterキーでタグ追加
                        className="flex-grow min-w-[120px]"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* フォーム全体のエラーメッセージ（例: サーバーサイドバリデーションエラーなど） */}
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
