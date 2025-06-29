import qaData from '@/app/(main)/help/qa-data.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuestionAnswer } from '@/types/qa';
import Link from 'next/link';

export default async function HelpPage() {
  const typedQaData: QuestionAnswer[] = qaData as QuestionAnswer[];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            よくある質問
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            アプリケーションに関する一般的な質問とその回答をまとめています。
          </p>
        </CardContent>
      </Card>

      {typedQaData.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {typedQaData.map((qa, index) => (
            <Card key={qa.question} className="mb-4 shadow-sm">
              <AccordionItem value={`item-${index}`} className="border-b">
                <AccordionTrigger className="text-lg font-semibold text-left px-4 py-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg transition-colors">
                  {qa.question}
                </AccordionTrigger>
                <AccordionContent className="p-4 pb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {qa.answer}
                </AccordionContent>
              </AccordionItem>
            </Card>
          ))}
          <Card className="mb-4 shadow-sm">
            <AccordionItem value="item-last" className="border-b">
              <AccordionTrigger className="text-lg font-semibold text-left px-4 py-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-t-lg transition-colors">
                iPhone/iPadの「共有」メニューからブックマークを登録する方法はありますか？
              </AccordionTrigger>
              <AccordionContent className="p-4 pb-0 text-gray-700 dark:text-gray-300 leading-relaxed">
                はい、iOSの「ショートカット」機能を利用して登録することができます。
                <br />
                <Link
                  href="/linkbox-template.shortcut"
                  className="text-blue-500"
                >
                  こちら
                </Link>
                のテンプレートを活用し、生成したAPIキーを利用することでご利用いただけます。
              </AccordionContent>
            </AccordionItem>
          </Card>
        </Accordion>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 mt-12 text-lg">
          現在、表示するQ&Aはありません。
        </p>
      )}
    </div>
  );
}
