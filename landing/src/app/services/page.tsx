'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const SERVICES = [
  {
    name: { en: 'Modern Landing Page Website', ja: 'モダンランディングページ' },
    bestFor: { en: 'Cafes, salons, gyms, tutors, local shops', ja: 'カフェ、サロン、ジム、個人塾、地元店舗' },
    price: '¥120,000–¥250,000',
  },
  {
    name: { en: 'Small Business Website (5–10 pages)', ja: '中規模ビジネスサイト（5〜10ページ）' },
    bestFor: { en: 'Schools, clinics, consultants, companies', ja: 'スクール、クリニック、コンサルタント、企業' },
    price: '¥300,000–¥600,000',
  },
  {
    name: { en: 'Bilingual Website (EN/JP)', ja: '英日バイリンガルサイト' },
    bestFor: { en: 'Tourism, international businesses', ja: '観光業、インターナショナルビジネス' },
    price: '+¥100,000–¥300,000',
    tag: { en: 'Add-on', ja: 'アドオン' },
  },
  {
    name: { en: 'Booking / Reservation Integration', ja: '予約・リザベーションシステム' },
    bestFor: { en: 'Salons, tutors, consultations', ja: 'サロン、家庭教師、コンサルティング' },
    price: '¥50,000–¥150,000',
  },
  {
    name: { en: 'AI Chatbot / Inquiry Assistant', ja: 'AIチャットボット・問い合わせアシスタント' },
    bestFor: { en: 'Schools, clinics, service businesses', ja: 'スクール、クリニック、サービス業' },
    price: '¥100,000–¥400,000',
  },
  {
    name: { en: 'Website Maintenance Plan', ja: 'ウェブサイト保守プラン' },
    bestFor: { en: 'Existing clients', ja: '既存のクライアント様' },
    price: '¥10,000–¥30,000/月',
  },
  {
    name: { en: 'Local SEO + Google Maps Setup', ja: 'ローカルSEO・Googleマップ設定' },
    bestFor: { en: 'Restaurants, local businesses', ja: 'レストラン、地域密着型ビジネス' },
    price: '¥30,000–¥100,000',
  },
  {
    name: { en: 'Portfolio / Personal Brand Site', ja: 'ポートフォリオ・個人ブランドサイト' },
    bestFor: { en: 'Creators, freelancers, professionals', ja: 'クリエイター、フリーランサー、専門家' },
    price: '¥80,000–¥200,000',
  },
];

const PACKAGES = [
  {
    rank: '🥇',
    badge: { en: 'Most Popular', ja: '最人気' },
    name: { en: 'Modern Bilingual Business Website', ja: 'モダン英日ビジネスウェブサイト' },
    price: '¥250,000–¥500,000',
    color: 'from-indigo-500 to-purple-600',
    border: 'border-indigo-400 dark:border-indigo-500',
    features: {
      en: [
        'English & Japanese copy',
        'Mobile-first, responsive design',
        'Modern SaaS-quality UI',
        'Contact form integration',
        'Performance optimised',
        'Hosted & deployed on Vercel',
      ],
      ja: [
        '英語・日本語コピー対応',
        'モバイルファースト・レスポンシブデザイン',
        'モダンSaaS品質のUI',
        '問い合わせフォーム統合',
        'パフォーマンス最適化',
        'Vercelでのホスティング・デプロイ',
      ],
    },
    cta: { en: 'Book a Free Consultation', ja: '無料相談を予約する' },
  },
  {
    rank: '🥈',
    badge: { en: 'Recurring Revenue', ja: '定期収益プラン' },
    name: { en: 'Monthly Support Plan', ja: '月額サポートプラン' },
    price: '¥10,000–¥30,000/月',
    color: 'from-teal-500 to-cyan-600',
    border: 'border-teal-400 dark:border-teal-500',
    features: {
      en: [
        'Content updates & edits',
        'Hosting & domain support',
        'Automated backups',
        'Uptime monitoring',
        'Security patches',
        'Priority email support',
      ],
      ja: [
        'コンテンツ更新・編集',
        'ホスティング・ドメインサポート',
        '自動バックアップ',
        '稼働時間モニタリング',
        'セキュリティパッチ',
        '優先メールサポート',
      ],
    },
    cta: { en: 'Get Started', ja: '始める' },
  },
  {
    rank: '🥉',
    badge: { en: 'Differentiator', ja: '差別化要素' },
    name: { en: 'AI Features & Integration', ja: 'AI機能・インテグレーション' },
    price: '¥100,000–¥400,000',
    color: 'from-purple-500 to-pink-600',
    border: 'border-purple-400 dark:border-purple-500',
    features: {
      en: [
        'AI FAQ assistant',
        'Inquiry chatbot',
        'AI translation helper',
        'Automated booking assistant',
        'Custom AI workflows',
        'Claude / GPT integration',
      ],
      ja: [
        'AI FAQアシスタント',
        '問い合わせチャットボット',
        'AI翻訳サポート',
        '予約自動化アシスタント',
        'カスタムAIワークフロー',
        'Claude / GPT統合',
      ],
    },
    cta: { en: 'Discuss Your Project', ja: 'プロジェクトを相談する' },
  },
];

export default function ServicesPage() {
  const { language } = useLanguage();
  const ja = language === 'ja';

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-gray-900 dark:text-white">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 dark:from-dark-surface dark:via-dark-card dark:to-dark-bg text-white py-24 px-4">
        <div className="absolute inset-0 opacity-10 dark:opacity-5 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/20 text-white mb-6">
            {ja ? 'ウェブ & AI ソリューション' : 'Web & AI Solutions'}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
            {ja
              ? '関西ビジネスのための\nバイリンガル Web & AI ソリューション'
              : 'Bilingual Web & AI Solutions\nfor Kansai Businesses'}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            {ja
              ? 'モダンなウェブデザインとAI技術を組み合わせ、関西の中小企業をデジタルで成長させます。英語・日本語完全対応。'
              : 'Modern web design meets practical AI. Helping Kansai small businesses grow online — in English and Japanese.'}
          </p>
          <Link
            href="/consultation/book"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg text-base"
          >
            {ja ? '無料相談を予約する' : 'Book a Free Consultation'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Positioning tagline */}
      <section className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {ja ? 'ポジショニング' : 'Our Positioning'}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {ja
                ? '「フリーランスウェブ開発者」ではなく…'
                : 'Not just a "freelance web developer" —'}
            </p>
            <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {ja
                ? '関西ビジネスのためのバイリンガル Web & AI パートナー'
                : 'Your Bilingual Web & AI Partner for Kansai Business'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { en: 'English / Japanese', ja: '英語・日本語' },
              { en: 'AI-Powered', ja: 'AI活用' },
              { en: 'Kansai-Based', ja: '関西拠点' },
            ].map((tag) => (
              <span
                key={tag.en}
                className="px-4 py-2 rounded-full text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700"
              >
                {ja ? tag.ja : tag.en}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Core packages */}
      <section className="py-20 px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {ja ? 'おすすめコアパッケージ' : 'Recommended Core Packages'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {ja
                ? '3つのメインサービスを組み合わせることで、ビジネスに最適なソリューションを提供します。'
                : 'Three focused offers that work together for lasting business results.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name.en}
                className={`relative bg-white dark:bg-dark-card rounded-2xl border-2 ${pkg.border} shadow-lg overflow-hidden flex flex-col`}
              >
                <div className={`bg-gradient-to-r ${pkg.color} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{pkg.rank}</span>
                    <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                      {ja ? pkg.badge.ja : pkg.badge.en}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug mb-1">
                    {ja ? pkg.name.ja : pkg.name.en}
                  </h3>
                  <p className="text-2xl font-extrabold mt-2">{pkg.price}</p>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {(ja ? pkg.features.ja : pkg.features.en).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 text-indigo-500 dark:text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/consultation/book"
                    className={`block text-center py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r ${pkg.color} text-white hover:opacity-90 transition`}
                  >
                    {ja ? pkg.cta.ja : pkg.cta.en}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full services table */}
      <section className="py-20 px-4 bg-white dark:bg-dark-surface">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {ja ? '全サービス一覧' : 'Full Services Menu'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {ja
                ? 'すべてのサービスをご覧ください。ご要望に合わせてカスタマイズも可能です。'
                : 'All available services — mix and match to fit your needs.'}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-card border-b border-light-border dark:border-dark-border">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    {ja ? 'サービス' : 'Service'}
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">
                    {ja ? '対象' : 'Best For'}
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">
                    {ja ? '価格' : 'Price'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((svc, i) => (
                  <tr
                    key={svc.name.en}
                    className={`border-b border-light-border dark:border-dark-border last:border-0 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition ${
                      i % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-dark-card/50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {ja ? svc.name.ja : svc.name.en}
                      </span>
                      {svc.tag && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                          {ja ? svc.tag.ja : svc.tag.en}
                        </span>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:hidden">
                        {ja ? svc.bestFor.ja : svc.bestFor.en}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">
                      {ja ? svc.bestFor.ja : svc.bestFor.en}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600 dark:text-purple-400 whitespace-nowrap">
                      {svc.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            {ja
              ? '* 価格はプロジェクトの範囲と要件によって異なります。'
              : '* Prices vary based on project scope and requirements. Custom quotes available.'}
          </p>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20 px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14">
            {ja ? 'なぜSignal Works Designを選ぶのか' : 'Why Signal Works Design?'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🌏',
                title: { en: 'Truly Bilingual', ja: '真のバイリンガル' },
                desc: {
                  en: 'Native English, fluent Japanese. Your message lands clearly with every customer.',
                  ja: 'ネイティブの英語力と流暢な日本語で、すべてのお客様に正確に伝えます。',
                },
              },
              {
                icon: '🤖',
                title: { en: 'AI-Ready', ja: 'AI対応' },
                desc: {
                  en: 'Few Kansai developers confidently offer AI chatbots and automation. We do.',
                  ja: '関西でAIチャットボットや自動化を自信を持って提供できる開発者は少ない。私たちは違います。',
                },
              },
              {
                icon: '⚡',
                title: { en: 'Modern Stack', ja: 'モダン技術スタック' },
                desc: {
                  en: 'Next.js, Vercel, Tailwind — the same stack used by top SaaS products.',
                  ja: 'トップSaaS企業と同じNext.js・Vercel・Tailwindを使用。',
                },
              },
              {
                icon: '🤝',
                title: { en: 'Long-Term Partner', ja: '長期パートナー' },
                desc: {
                  en: 'Monthly support plans mean we stay invested in your growth, not just the launch.',
                  ja: '月額サポートプランで、ローンチ後もあなたの成長を継続的にサポートします。',
                },
              },
            ].map((item) => (
              <div
                key={item.title.en}
                className="bg-white dark:bg-dark-card rounded-2xl border border-light-border dark:border-dark-border p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                  {ja ? item.title.ja : item.title.en}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {ja ? item.desc.ja : item.desc.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            {ja ? 'プロジェクトについて話しましょう' : "Let's Talk About Your Project"}
          </h2>
          <p className="text-indigo-100 text-lg mb-10">
            {ja
              ? '無料相談で、あなたのビジネスに最適なウェブ・AIソリューションをご提案します。'
              : 'Free 30-minute consultation. No commitment, no hard sell — just honest advice for your business.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/consultation/book"
              className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition shadow-lg"
            >
              {ja ? '無料相談を予約する' : 'Book a Free Consultation'}
            </Link>
            <Link
              href="/"
              className="px-8 py-4 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition"
            >
              {ja ? 'コースを見る' : 'View Courses'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
