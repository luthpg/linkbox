'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

const ApiKeyNameSchema = z
  .string()
  .max(50, { message: 'キー名は50文字以内で入力してください。' })
  .nullable();

const maskApiKey = (key: string) => {
  if (key.length < 10) return key;
  return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
};

/**
 * APIキー管理ページコンポーネント。
 * ConvexのuseQueryとuseMutationフックを使用してAPIキーの取得、生成、削除を行います。
 */
export default function ConfigPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null,
  );
  const [keyNameInput, setKeyNameInput] = useState('');
  const [keyNameError, setKeyNameError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Convexフック ---
  // APIキー一覧を取得 (リアルタイム同期)
  // `apiKeys` はロード中 `undefined`、エラー/未認証 `null`、データあり `ApiKey[]` となります。
  const apiKeys = useQuery(api.apiKeys.getApiKeys);

  const generateApiKeyMutation = useMutation(api.apiKeys.generateApiKey);
  const generateApiKeyProcedure = async (
    ...arg: Parameters<typeof generateApiKeyMutation>
  ) => {
    setIsGenerating(true);
    const response = await generateApiKeyMutation(...arg);
    setIsGenerating(false);
    return response;
  };
  const deleteApiKeyMutation = useMutation(api.apiKeys.deleteApiKey);
  const deleteApiKeyProcedure = async (
    ...arg: Parameters<typeof deleteApiKeyMutation>
  ) => {
    setIsDeleting(true);
    const response = await deleteApiKeyMutation(...arg);
    setIsDeleting(false);
    return response;
  };

  /**
   * APIキー生成ボタンのハンドラ。
   * 入力されたキー名で新しいAPIキーを生成します。
   */
  const handleGenerateKey = async () => {
    const validationResult = ApiKeyNameSchema.safeParse(
      keyNameInput.trim() || null,
    );
    if (!validationResult.success) {
      setKeyNameError(validationResult.error.errors[0].message);
      return;
    }
    setKeyNameError(null);
    setNewlyGeneratedKey(null);

    try {
      const data = await generateApiKeyProcedure({
        name: keyNameInput.trim() || undefined,
      });
      setNewlyGeneratedKey(data.api_key);
      setKeyNameInput('');

      toast.success('APIキーを生成しました', {
        description:
          '新しいAPIキーが正常に生成されました。このキーは一度しか表示されません。',
      });
    } catch (err) {
      console.error('Failed to generate API key:', err);
      toast.error('APIキーの生成に失敗しました', {
        description: (err as Error).message || 'エラーが発生しました。',
      });
    }
  };

  /**
   * 削除ボタンクリック時のハンドラ。
   * 確認ダイアログを表示します。
   * @param id 削除対象のAPIキーのID
   */
  const handleDeleteClick = (id: string) => {
    setKeyToDelete(id);
    setShowDeleteConfirm(true);
  };

  /**
   * 削除確認ダイアログでの確定ボタンハンドラ。
   * 選択されたAPIキーを削除します。
   */
  const confirmDelete = async () => {
    if (!keyToDelete) return;

    setShowDeleteConfirm(false);

    try {
      await deleteApiKeyProcedure({ id: keyToDelete as Id<'apiKeys'> });
      setKeyToDelete(null);

      toast.success('APIキーを削除しました', {
        description: '指定されたAPIキーが正常に削除されました。',
      });
    } catch (err) {
      // エラーをanyとしてキャッチ
      console.error('Failed to delete API key:', err);
      toast.error('APIキーの削除に失敗しました', {
        description: (err as Error).message || 'エラーが発生しました。',
      });
    }
  };

  /**
   * 削除確認ダイアログでのキャンセルボタンハンドラ。
   */
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setKeyToDelete(null);
  };

  /**
   * テキストをクリップボードにコピーするハンドラ。
   * @param text コピーする文字列
   */
  const copyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.info('コピーしました', {
        description: 'APIキーがクリップボードにコピーされました。',
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('コピーに失敗しました', {
        description: 'APIキーのコピーに失敗しました。',
      });
    }
  };

  // --- UIレンダリング ---

  // apiKeysがundefinedの場合（Convexからデータロード中）
  if (apiKeys === undefined) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          APIキー管理
        </h1>
        <p>APIキーを読み込み中...</p>
      </div>
    );
  }

  // apiKeysがnullの場合（未認証またはConvex関数からのエラー）
  if (apiKeys === null) {
    return (
      <div className="flex flex-col gap-6 p-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          APIキー管理
        </h1>
        <p className="text-red-500">
          APIキーの取得に失敗しました。ログインしていることを確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        APIキー管理
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>新しいAPIキーを生成</CardTitle>
          <CardDescription>
            API経由でブックマークを登録するための新しい認証キーを生成します。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Input
              placeholder="キーの名前 (任意)"
              value={keyNameInput}
              onChange={(e) => {
                setKeyNameInput(e.target.value);
                const validationResult = ApiKeyNameSchema.safeParse(
                  e.target.value.trim() || null,
                );
                if (!validationResult.success) {
                  setKeyNameError(validationResult.error.errors[0].message);
                } else {
                  setKeyNameError(null);
                }
              }}
            />
            {keyNameError && (
              <p className="text-red-500 text-sm mt-1">{keyNameError}</p>
            )}
          </div>
          <Button
            onClick={handleGenerateKey}
            disabled={isGenerating || !!keyNameError} // isGeneratingをConvexフックから取得
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              '生成中...'
            ) : (
              <>
                <PlusIcon className="h-5 w-5" /> APIキーを生成
              </>
            )}
          </Button>
          {newlyGeneratedKey && (
            <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-2">
                新しいAPIキー (一度のみ表示されます):
              </p>
              <div className="flex items-center break-all">
                <code className="flex-grow font-mono bg-yellow-50 dark:bg-yellow-800 p-2 rounded mr-2 text-yellow-900 dark:text-yellow-100">
                  {newlyGeneratedKey}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(newlyGeneratedKey)}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2">このキーを安全な場所に保存してください。</p>
            </div>
          )}
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6">
        既存のAPIキー
      </h2>
      {apiKeys.length === 0 ? ( // apiKeysが空配列の場合
        <p className="text-gray-600 dark:text-gray-300">
          まだAPIキーがありません。上記で生成してください。
        </p>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">
                    {key.name || '名前なしのキー'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {key.id.substring(0, 8)}... - 作成日:{' '}
                    {new Date(key.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono mt-1">
                    **********{key.id.substring(key.id.length - 4)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteClick(key.id)}
                  disabled={isDeleting} // isDeletingをConvexフックから取得
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>APIキーを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このAPIキーは完全に削除され、元に戻すことはできません。このキーを使用するすべてのAPIリクエストは機能しなくなります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={isDeleting}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
