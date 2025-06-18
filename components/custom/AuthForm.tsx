'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SiGoogle } from '@icons-pack/react-simple-icons';

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * 汎用認証フォームコンポーネント（Google OAuth専用）。
 * Googleサインインボタンのみを表示します。
 * @param type フォームのタイプ ('login' または 'signup') - 現在はUI表示のみ
 * @param onSubmit Google認証開始時に呼び出される関数
 * @param isLoading フォームの送信中を示すブール値
 * @param error 表示するエラーメッセージ
 */
export function AuthForm({ type, onSubmit, isLoading, error }: AuthFormProps) {
  const title = type === 'login' ? 'ログイン' : 'サインアップ';
  const description =
    type === 'login'
      ? 'Googleアカウントでログインしてください。'
      : 'Googleアカウントで新しいアカウントを作成してください。';
  const buttonText =
    type === 'login' ? 'Googleでログイン' : 'Googleでサインアップ';

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <Button
          type="button"
          className="w-full flex items-center justify-center gap-2"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            '処理中...'
          ) : (
            <>
              <SiGoogle className="h-5 w-5" /> {buttonText}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
