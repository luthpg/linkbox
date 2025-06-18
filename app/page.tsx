'use client';

import { LoginButton } from '@/components/custom/LoginButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SignIn, SignedIn } from '@clerk/nextjs';
import { BookOpenTextIcon, KeyRoundIcon, SparklesIcon } from 'lucide-react';

export default function Home() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-2xl text-center shadow-lg">
          <CardHeader className="pb-6">
            <SparklesIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <CardTitle className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
              linkbox
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              あなたのWebの情報を、もっと賢く、もっと管理しやすく。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
              <div>
                <div className="flex mt-1 justify-center-safe">
                  <BookOpenTextIcon className="h-8 w-8 text-green-500 mr-1 md:mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    リッチブックマーク管理
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-400 mt-1">
                  URLを入力するだけで、OGP情報（タイトル、画像、説明）を自動取得し、視覚的に分かりやすく整理できます。メモやタグも自由に追加可能です。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
              <div>
                <div className="flex mt-1 justify-center-safe">
                  <KeyRoundIcon className="h-8 w-8 text-purple-500 mr-1 md:mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    API経由での登録
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-400 mt-1">
                  発行したAPIキーを使って、外部サービスやスクリプトからプログラムでブックマークを登録できます。開発者にも優しい設計です。
                </p>
              </div>
            </div>

            <div className="mt-4">
              <LoginButton className="w-full" />
            </div>
          </CardContent>
        </Card>
        <footer className="mt-4">
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2025 linkbox. All rights reserved.
          </p>
          利用規約 | プライバシーポリシー
        </footer>
      </div>
    </>
  );
}
