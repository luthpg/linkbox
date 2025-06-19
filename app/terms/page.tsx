import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * 利用規約ページコンポーネント。
 * アプリケーションの利用規約を静的に表示します。
 * これはServer Componentとして機能します。
 */
export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            利用規約
          </CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          <p className="mb-4">
            この利用規約（以下、「本規約」といいます。）は、Cider（以下、「当方」といいます。）が提供する「ブックマークアプリ」（以下、「本サービス」といいます。）の利用に関する条件を定めるものです。本サービスをご利用になるすべてのユーザー（以下、「ユーザー」といいます。）は、本規約に同意の上、本サービスを利用するものとします。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第1条（本規約への同意）
          </h2>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>
              ユーザーは、本サービスの利用を開始する前に本規約のすべてに同意するものとします。
            </li>
            <li>
              ユーザーが本サービスの利用を開始した場合、本規約に同意したものとみなします。
            </li>
            <li>
              未成年者は、親権者等の法定代理人の同意を得て本サービスを利用するものとします。未成年者が本サービスを利用した場合、法定代理人の同意を得たものとみなします。
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第2条（本サービスの内容）
          </h2>
          <p className="mb-4">本サービスは、以下の機能を提供します。</p>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>ウェブサイトのURL、タイトル、メモ、タグの保存・管理機能</li>
            <li>OGP（Open Graph Protocol）情報の自動取得機能</li>
            <li>APIキーを使用した外部からのブックマーク登録機能</li>
            <li>保存したブックマークの一覧表示、検索、編集、削除機能</li>
            <li>ユーザーごとのAPIキー管理機能</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第3条（利用登録）
          </h2>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>
              本サービスの利用には、当方が別途指定する方法による利用登録が必要です。
            </li>
            <li>
              ユーザーは、利用登録の際、真実かつ正確な情報を提供しなければなりません。
            </li>
            <li>
              当方は、ユーザーが以下のいずれかに該当すると判断した場合、利用登録を拒否することができます。
              <ul className="list-disc list-inside ml-4">
                <li>本規約に違反するおそれがあると判断した場合</li>
                <li>登録情報に虚偽、誤記、不備があった場合</li>
                <li>過去に本サービスの利用を停止されたことがある場合</li>
                <li>その他、当方が不適切と判断した場合</li>
              </ul>
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第4条（ユーザーIDおよびパスワードの管理）
          </h2>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>
              ユーザーは、自己の責任において、本サービスに関するユーザーIDおよびパスワードを厳重に管理するものとします。
            </li>
            <li>
              ユーザーは、ユーザーIDおよびパスワードを第三者に貸与、譲渡、名義変更、売買等してはならないものとします。
            </li>
            <li>
              ユーザーIDおよびパスワードの管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任は、ユーザーが負うものとし、当方は一切の責任を負いません。
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">第5条（料金）</h2>
          <p className="mb-4">
            本サービスの利用は、原則として無料です。ただし、将来的に有料サービスを提供する場合は、事前にユーザーに通知し、同意を得た上で提供するものとします。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第6条（禁止事項）
          </h2>
          <p className="mb-4">
            ユーザーは、本サービスの利用にあたり、以下の行為を行ってはならないものとします。
          </p>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              当方または第三者の著作権、商標権、特許権等の知的財産権、肖像権、プライバシー権、名誉権その他の権利または利益を侵害する行為
            </li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>本サービスを通じて利用しうる情報を改ざんする行為</li>
            <li>
              本サービスに接続されているサーバーまたはネットワークを妨害、混乱させる行為
            </li>
            <li>
              当方のネットワークまたはシステム等に不正にアクセスし、または不正なアクセスを試みる行為
            </li>
            <li>
              本サービスを利用して、反社会的勢力に対する利益供与その他の協力行為を行うこと
            </li>
            <li>その他、当方が不適切と判断する行為</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第7条（本サービスの停止等）
          </h2>
          <p className="mb-4">
            当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>
              本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
            </li>
            <li>
              地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
            </li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当方が本サービスの提供が困難と判断した場合</li>
          </ol>
          <p className="mb-4">
            当方は、本条に基づき当方が行った措置によりユーザーに生じた損害について一切の責任を負いません。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第8条（利用制限および登録抹消）
          </h2>
          <p className="mb-4">
            当方は、ユーザーが以下のいずれかに該当する場合には、事前の通知なく、本サービスの全部もしくは一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
          </p>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>本規約のいずれかの条項に違反した場合</li>
            <li>登録情報に虚偽の事実があることが判明した場合</li>
            <li>その他、当方が本サービスの利用を適当でないと判断した場合</li>
          </ol>
          <p className="mb-4">
            当方は、本条に基づき当方が行った行為によりユーザーに生じた損害について一切の責任を負いません。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第9条（免責事項）
          </h2>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>
              当方は、本サービスの内容の正確性、完全性、信頼性、特定の目的に対する適合性について、いかなる保証も行いません。
            </li>
            <li>
              当方は、本サービスによってユーザーに生じたあらゆる損害について、一切の責任を負いません。
            </li>
            <li>
              当方は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第10条（本規約の変更）
          </h2>
          <p className="mb-4">
            当方は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。本規約の変更後、本サービスの利用を開始した場合には、当該ユーザーは変更後の規約に同意したものとみなされます。
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-3">
            第11条（準拠法・裁判管轄）
          </h2>
          <ol className="list-decimal list-inside ml-4 mb-4">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>
              本サービスに関して紛争が生じた場合には、当方の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-3">附則</h2>
          <p className="mb-4">
            制定日：2025/06/30
            <br />
            最終改定日：2025/06/30
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
