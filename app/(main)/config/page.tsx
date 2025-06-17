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
import type { ApiKey } from '@/types/api-key';
import { useQuery } from 'convex/react';
import { CopyIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState<string | null>(
    null,
  );
  const [keyNameInput, setKeyNameInput] = useState('');
  const [keyNameError, setKeyNameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKeys = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const data = useQuery(api.apiKeys.getApiKeys);
        if (!data) throw new Error('Failed to fetch API keys');
        setApiKeys(data);
      } catch (err) {
        console.error('Failed to fetch API keys:', err);
        setFetchError(
          `APIキーの取得中にエラーが発生しました: ${(err as Error).message}`,
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchApiKeys();
  }, []);

  const handleGenerateKey = async () => {
    const validationResult = ApiKeyNameSchema.safeParse(
      keyNameInput.trim() || null,
    );
    if (!validationResult.success) {
      setKeyNameError(validationResult.error.errors[0].message);
      return;
    }

    setKeyNameError(null);
    setIsGenerating(true);
    setFetchError(null);
    setNewlyGeneratedKey(null);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: keyNameInput.trim() || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setApiKeys((prev) => [data, ...prev]);
      setNewlyGeneratedKey(data.api_key);
      setKeyNameInput('');

      toast.success('APIキーを生成しました', {
        description:
          '新しいAPIキーが正常に生成されました。一度だけ表示されます。',
      });
    } catch (err) {
      console.error('Failed to generate API key:', err);
      toast.error('APIキーの生成に失敗しました', {
        description: (err as Error).message || 'エラーが発生しました。',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setKeyToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!keyToDelete) return;

    setIsDeleting(true);
    setShowDeleteConfirm(false);

    try {
      const response = await fetch(`/api/api-keys/${keyToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Error: ${response.status} ${response.statusText}`,
        );
      }

      setApiKeys((prev) => prev.filter((key) => key.id !== keyToDelete));
      setKeyToDelete(null);

      toast.success('APIキーを削除しました', {
        description: '指定されたAPIキーが正常に削除されました。',
      });
    } catch (err) {
      console.error('Failed to delete API key:', err);
      toast.error('APIキーの削除に失敗しました', {
        description: (err as Error).message || 'エラーが発生しました。',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setKeyToDelete(null);
  };

  const copyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast.info('コピーしました', {
        description: 'APIキーがクリップボードにコピーされました。',
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('コピーに失敗しました', {
        description: 'APIキーのコピーに失敗しました。',
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        APIキー管理
      </h1>

      {fetchError && <div className="text-red-500 mb-4">{fetchError}</div>}

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
            disabled={isGenerating || !!keyNameError}
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
      {isLoading ? (
        <p>APIキーを読み込み中...</p>
      ) : apiKeys.length === 0 ? (
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
                  disabled={isDeleting}
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
