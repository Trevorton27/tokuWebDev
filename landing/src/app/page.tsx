'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ASSESSMENT_URL = process.env.NEXT_PUBLIC_ASSESSMENT_URL || '';

const FAQ_EN = [
  {
    q: 'Is the course taught in English or Japanese?',
    a: 'The course is delivered primarily in English, with Japanese support available throughout. Trevor is bilingual and can explain concepts, answer questions, and provide feedback in Japanese when needed. You will not be left struggling alone with English.',
  },
  {
    q: 'Do I need to be fluent in English to participate?',
    a: 'No. Everyday conversational or reading-level English is helpful, but it is not a requirement. The tools and concepts taught in the course are universal, and you will always have Japanese-language support available from the instructor.',
  },
  {
    q: 'Can I join with absolutely no programming experience?',
    a: 'Yes. The course is specifically designed for complete beginners. You do not need to know anything about coding before you start. The assessment at the beginning helps us understand exactly where you are so we can build from there.',
  },
  {
    q: 'Can I take this course while working full-time?',
    a: 'Yes, but it requires honest commitment. The program is designed around approximately 10–20 hours per week. Students working full-time can complete it, but the timeline may need to flex. The extension option exists specifically for this reason.',
  },
  {
    q: 'Do I need a Mac, or will Windows work?',
    a: 'Either works. The tools used in this course — VS Code, Git, Node.js, and Vercel — run on both Mac and Windows. You will be guided through environment setup from the very beginning.',
  },
  {
    q: 'What computer specs do I need?',
    a: 'Any modern laptop or desktop purchased within the last 5–6 years should be sufficient. 8GB of RAM is the minimum recommended. You do not need a powerful machine to learn web development.',
  },
  {
    q: 'Will I receive a certificate when I finish?',
    a: 'Yes. A certificate of completion is issued upon finishing the program. More importantly, you will graduate with a portfolio of 5 real, deployed projects — which is far more valuable to employers than a certificate alone.',
  },
  {
    q: 'What kind of jobs can I aim for after completing the course?',
    a: 'Junior frontend or full-stack developer roles, freelance web development work, internal IT or DX roles at Japanese companies, or the ability to build your own product or tool. The course focuses on practical, deployable skills employers can verify directly from your portfolio.',
  },
  {
    q: 'Is this relevant for job hunting in Japan specifically?',
    a: 'Yes. The tech stack taught — React, Next.js, TypeScript, Vercel, databases, AI integration — is in demand at both Japanese tech companies and international companies based in Japan. The bilingual nature of the program also positions you well for roles requiring English.',
  },
  {
    q: 'Can I really finish everything in 5 months?',
    a: '5 months is the structured timeline for a committed student putting in consistent weekly effort. Some students will move faster; others may need more time. The extension option allows you to continue at a discounted rate beyond 5 months until you feel truly ready.',
  },
  {
    q: 'What happens if I fall behind or miss sessions?',
    a: 'The program is flexible by design. If life gets in the way, you can slow down and use the extension option to complete the remaining work at a discounted rate. You will never be dropped for falling behind.',
  },
  {
    q: 'Is there a payment plan available?',
    a: 'Yes. Installment payment options are available. Please contact us to discuss what works best for your situation. The goal is to make this accessible.',
  },
  {
    q: 'What is the refund policy?',
    a: 'Please contact us before enrolling to discuss the refund policy in detail. We encourage a free consultation first to make sure the course is the right fit before any financial commitment is made.',
  },
  {
    q: 'Are sessions live, or do I work through pre-recorded material?',
    a: 'The course is a hybrid of both. There are live instructor sessions combined with self-paced project work. You will have regular access to the instructor and are not simply watching videos alone.',
  },
  {
    q: 'How do I ask questions when I am stuck?',
    a: 'You will have direct access to the instructor through the course platform messaging system. Questions can be asked in English or Japanese. You are not expected to struggle silently.',
  },
  {
    q: 'Do I need English to use the AI tools like GitHub Copilot and Claude?',
    a: 'The AI tools work best with English prompts, but you will be taught how to use them effectively as part of the course. Learning to work with these tools in English is itself a valuable skill, and you will be guided through it step by step.',
  },
  {
    q: 'Are the 5 projects fixed, or can I build something related to my own interests?',
    a: 'The 5 projects listed on the site are examples only. Your actual projects will be tailored to your interests, level, and personality. If you are passionate about fitness, education, finance, or anything else — we build toward that.',
  },
  {
    q: 'How much does extending the course cost, and how long can I extend?',
    a: 'Extension pricing is offered at a meaningful discount from the standard rate and is decided on a case-by-case basis. Extensions are available for as long as you need — the goal is for you to leave feeling genuinely capable and confident, not to push you out the door on a fixed schedule.',
  },
];

const FAQ_JA = [
  {
    q: 'コースは英語と日本語どちらで教えますか？',
    a: '主に英語で進みますが、日本語サポートも常時利用可能です。トレバーはバイリンガルで、必要に応じて日本語で説明・フィードバックを提供します。英語だけで一人で悩む心配はありません。',
  },
  {
    q: '英語が堪能でなくても受講できますか？',
    a: 'はい。日常的な読み書きレベルの英語があれば十分ですが、それも必須ではありません。学ぶ技術は普遍的であり、講師からの日本語サポートは常に受けられます。',
  },
  {
    q: 'プログラミング未経験でも参加できますか？',
    a: 'はい。このコースは完全な初心者向けに設計されています。コーディングの知識はゼロで問題ありません。開始前のアセスメントで現在のレベルを把握し、そこから一緒に積み上げていきます。',
  },
  {
    q: 'フルタイムで働きながら受講できますか？',
    a: '可能ですが、誠実なコミットメントが必要です。週10〜20時間が目安です。フルタイム勤務の方でも修了できますが、スケジュールが伸びる場合があります。そのための延長オプションがあります。',
  },
  {
    q: 'MacとWindowsどちらのパソコンが必要ですか？',
    a: 'どちらでも問題ありません。VS Code・Git・Node.js・VercelはMac・Windowsどちらでも動作します。環境構築は最初からサポートします。',
  },
  {
    q: 'どのくらいのスペックのパソコンが必要ですか？',
    a: '購入から5〜6年以内の一般的なノートパソコンやデスクトップで十分です。最低8GBのRAMが推奨されます。高性能なマシンは必要ありません。',
  },
  {
    q: '修了時に証明書は発行されますか？',
    a: 'はい、修了証を発行します。それ以上に、デプロイ済みの5つのプロジェクトで構成されたポートフォリオが最大の証明となります。証明書だけよりはるかに採用担当者に響きます。',
  },
  {
    q: '修了後にどんな仕事を目指せますか？',
    a: 'ジュニアのフロントエンドまたはフルスタック開発者、フリーランスのWeb開発、日本企業のIT・DX部門、または自分のプロダクトの構築などが挙げられます。ポートフォリオから直接確認できる実践的スキルに焦点を当てています。',
  },
  {
    q: '日本での就職活動に役立ちますか？',
    a: 'はい。React・Next.js・TypeScript・Vercel・データベース・AI統合など、教えるスタックは日本のIT企業や日本拠点の外資系企業で需要があります。バイリンガルな環境も英語が必要なポジションで有利に働きます。',
  },
  {
    q: '本当に5ヶ月で終わりますか？',
    a: '5ヶ月は、一定の週次学習量をこなす意欲的な受講生のための目安です。早く終わる方もいれば、もう少し時間が必要な方もいます。延長オプションにより、割引価格で5ヶ月以降も継続できます。',
  },
  {
    q: '遅れたり休んだりしたらどうなりますか？',
    a: 'プログラムは柔軟に設計されています。生活上の都合があっても、ペースを落として割引価格の延長オプションで残りを完了できます。遅れたからといって退出させられることはありません。',
  },
  {
    q: '分割払いは可能ですか？',
    a: 'はい、分割払いオプションがあります。状況に合った方法についてはお気軽にご相談ください。できる限り参加しやすい形を一緒に考えます。',
  },
  {
    q: '返金ポリシーはどうなっていますか？',
    a: '詳細はご入学前にお問い合わせください。財務的なコミットメントの前に、無料相談でコースが適切かどうかを確認することを強くお勧めしています。',
  },
  {
    q: '授業はライブですか、録画済みですか？',
    a: '両方を組み合わせたハイブリッド形式です。ライブの講師セッションと自分のペースで進めるプロジェクト作業があります。動画を一人で見るだけのコースではありません。',
  },
  {
    q: '詰まったときはどうやって質問できますか？',
    a: 'コースプラットフォームのメッセージ機能を通じて講師に直接連絡できます。英語・日本語どちらでも構いません。一人で悩み続ける必要はありません。',
  },
  {
    q: 'AIツールを使うのに英語力は必要ですか？',
    a: 'AIツールは英語のプロンプトで最もよく機能しますが、その使い方はコースの中でしっかり教えます。英語でAIツールを扱う方法を学ぶこと自体が価値あるスキルであり、ステップごとにサポートします。',
  },
  {
    q: '5つのプロジェクトは固定ですか、自分の興味に合わせられますか？',
    a: 'サイトに掲載されている5つのプロジェクトはあくまで例です。実際のプロジェクトはあなたの興味・レベル・個性に合わせてカスタマイズされます。フィットネス・教育・金融など、好きな分野に向けて構築できます。',
  },
  {
    q: '延長する場合の料金と期間はどのくらいですか？',
    a: '延長料金は通常料金から大幅に割引されており、個別に相談の上決定します。期間の上限はありません。固定スケジュールで追い出すことではなく、自信を持って自立できる状態で卒業することが目標です。',
  },
];

export default function Home() {
  const { language, t } = useLanguage();
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqItems = language === 'ja' ? FAQ_JA : FAQ_EN;

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormStatus('loading');
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setFormStatus(res.ok ? 'success' : 'error');
    } catch {
      setFormStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* ============================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================ */}
      <section id="home" className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
            {t('home.heroBadge')}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg md:text-2xl mb-6 max-w-3xl mx-auto text-indigo-100">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-indigo-200">
            {t('home.heroSupporting')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={ASSESSMENT_URL || '#contact'}
              className="px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg"
            >
              {t('home.heroCta')}
            </a>
            <a
              href="#curriculum"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition"
            >
              {t('home.heroCtaSecondary')}
            </a>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-indigo-200">
            <span className="font-semibold text-white">¥200,000</span>
            <span className="text-white/40">·</span>
            <span>5 months</span>
            <span className="text-white/40">·</span>
            <span>Limited seats per cohort</span>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 2. PROBLEM SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.problemTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.problemSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(`home.problem${n}Title` as any)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`home.problem${n}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 3. SOLUTION SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.solutionTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.solutionSubtitle')}
            </p>
          </div>

          {/* Hybrid Model Highlight */}
          <div className="max-w-4xl mx-auto mb-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800/50">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
              {t('home.solutionHybridTitle')}
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              {t('home.solutionHybridDesc')}
            </p>
          </div>

          {/* Three pillars */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionInstructorTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionInstructorDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionAiTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionAiDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
              <div className="w-12 h-12 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('home.solutionPersonalTitle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('home.solutionPersonalDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4. HOW IT WORKS - 4 STEPS */}
      {/* ============================================ */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.howItWorksTitle')}
            </h2>
          </div>
          <div className="max-w-5xl mx-auto space-y-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col md:flex-row items-start gap-6 bg-white dark:bg-dark-card rounded-2xl p-8 border border-gray-200 dark:border-dark-border shadow-sm">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                    {n}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                    {t('home.howStepLabel')} {n}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t(`home.howStep${n}Title` as any)}
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t(`home.howStep${n}Desc` as any)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 4.5. AI-POWERED SOFTWARE DEVELOPMENT */}
      {/* ============================================ */}
      <section id="ai-development" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
              The Modern Approach
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Is Full Course: AI-Powered Software Development?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              AI-powered software development is the practice of building applications while using AI tools to accelerate, enhance, and guide the development process.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-3">
              Instead of replacing developers, AI acts as a real-time assistant—helping you write code, solve problems, and learn faster.
            </p>
          </div>

          {/* How AI Helps */}
          <div className="max-w-5xl mx-auto mb-20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">How AI Helps You Build Software</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Write code faster', desc: 'AI can generate functions, components, and boilerplate instantly—so you spend less time on repetitive work and more time on meaningful logic.', color: 'indigo' },
                { title: 'Understand complex concepts', desc: 'Stuck on an error or unfamiliar topic? AI can explain code, debug issues, and break down concepts in real time.', color: 'purple' },
                { title: 'Improve code quality', desc: 'AI can suggest better patterns, catch mistakes, and help you refactor code into cleaner, more maintainable solutions.', color: 'teal' },
                { title: 'Learn more efficiently', desc: 'Instead of searching through dozens of tutorials, you get personalized guidance exactly when you need it.', color: 'blue' },
                { title: 'Build more ambitious projects', desc: 'With AI handling low-level friction, you can focus on building real-world applications sooner.', color: 'pink' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                  <div className={`w-10 h-10 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center mb-4`}>
                    <svg className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}

              {/* What This Looks Like card */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">What This Looks Like in Practice</h4>
                <ul className="space-y-2">
                  {[
                    'Generating a React component from a simple description',
                    'Debugging an API error with step-by-step guidance',
                    'Getting instant feedback on your code',
                    'Building full features with AI-assisted iteration',
                    'Learning new frameworks with on-demand explanations',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Why It Matters */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="bg-gray-900 dark:bg-dark-card rounded-2xl p-8 md:p-10 text-white">
              <h3 className="text-2xl font-bold mb-4">Why It Matters</h3>
              <p className="text-gray-300 mb-6">Software development is evolving. AI is becoming a standard tool in every developer's workflow, much like:</p>
              <div className="flex flex-wrap gap-3 mb-6">
                {['Version Control (Git)', 'Frameworks (React, Next.js)', 'Cloud Platforms (AWS, Vercel)'].map((tool) => (
                  <span key={tool} className="px-4 py-2 bg-white/10 rounded-full text-sm font-medium">{tool}</span>
                ))}
              </div>
              <p className="text-gray-300 mb-3">Developers who know how to use AI effectively will:</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {['Learn faster', 'Build faster', 'Solve more complex problems'].map((point) => (
                  <div key={point} className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-3">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-10">Development With AI vs Without AI</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Without AI */}
              <div className="rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
                <div className="bg-gray-100 dark:bg-dark-surface px-6 py-4">
                  <h4 className="font-bold text-gray-900 dark:text-white">Traditional Development</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Without AI</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">How it works</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Write and debug everything manually</li>
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Learning relies on documentation, tutorials, and trial-and-error</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Strong foundational understanding</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Predictable and controlled workflows</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Deep problem-solving skills</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Challenges</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Slower development speed</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>High friction when learning new tools</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Time lost searching for answers and debugging</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* With AI */}
              <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <h4 className="font-bold text-white">AI-Powered Development</h4>
                  <p className="text-sm text-indigo-200">With AI</p>
                </div>
                <div className="bg-white dark:bg-dark-card p-6 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">How it works</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>Collaborate with AI tools during development</li>
                      <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">•</span>AI assists with coding, debugging, and learning in real time</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Faster development and iteration</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Immediate feedback and guidance</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Easier to learn new technologies</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Reduced time on repetitive tasks</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2">Challenges</p>
                    <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Requires judgment to evaluate AI output</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Risk of over-reliance without understanding fundamentals</li>
                      <li className="flex items-start gap-2"><svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Still needs strong core knowledge to use effectively</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Line */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Most Effective Approach</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The best developers don&apos;t choose one or the other—they combine both.
                <br /><strong className="text-gray-900 dark:text-white">Fundamentals</strong> give you understanding and control.
                <strong className="text-gray-900 dark:text-white"> AI tools</strong> give you speed and leverage.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {['Build real applications faster', 'Learn more efficiently', 'Work at a higher level of abstraction'].map((point) => (
                  <div key={point} className="bg-white dark:bg-dark-card rounded-lg px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-border">
                    {point}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Learning to code is still essential. But learning to code <em>with AI</em> is what makes you truly effective in today&apos;s landscape.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* 5. FEATURES / BENEFITS */}
      {/* ============================================ */}
      <section id="features" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.whyChoose')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { titleKey: 'home.adaptiveLearningTitle', descKey: 'home.adaptiveLearningDesc', color: 'indigo' },
              { titleKey: 'home.aiTutoringTitle', descKey: 'home.aiTutoringDesc', color: 'purple' },
              { titleKey: 'home.realProjectsTitle', descKey: 'home.realProjectsDesc', color: 'teal' },
              { titleKey: 'home.multilingualTitle', descKey: 'home.multilingualDesc', color: 'pink' },
              { titleKey: 'home.progressTrackingTitle', descKey: 'home.progressTrackingDesc', color: 'blue' },
              { titleKey: 'home.comprehensiveCoursesTitle', descKey: 'home.comprehensiveCoursesDesc', color: 'green' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border hover:shadow-md transition">
                <div className={`w-10 h-10 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4`}>
                  <svg className={`w-5 h-5 text-${feature.color}-600 dark:text-${feature.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t(feature.titleKey as any)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(feature.descKey as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 6. CURRICULUM PREVIEW */}
      {/* ============================================ */}
      <section id="curriculum" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.curriculumTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.curriculumSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: 'home.foundationsTitle', items: ['home.foundationsItem1', 'home.foundationsItem3', 'home.foundationsItem4'] },
              { title: 'home.frontendTitle', items: ['home.frontendItem1', 'home.frontendItem2', 'home.frontendItem3'] },
              { title: 'home.backendTitle', items: ['home.backendItem1', 'home.backendItem2', 'home.backendItem3'] },
            ].map((module, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t(module.title as any)}
                </h3>
                <ul className="space-y-2">
                  {module.items.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-indigo-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t(item as any)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 7. OUTCOMES */}
      {/* ============================================ */}
      <section id="outcomes" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.outcomesTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.outcomesSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((n) => (
              <div key={n} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-white text-2xl font-bold">{n}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t(`home.outcome${n}Title` as any)}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  {t(`home.outcome${n}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 8. ABOUT */}
      {/* ============================================ */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-stretch gap-12">
              <div className="flex-shrink-0 self-stretch hidden md:flex">
                <div className="relative w-72 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-800">
                  <Image
                    src="/trevor-profile.png"
                    alt="Trevor — Software Professional and Educator"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-shrink-0 md:hidden flex justify-center">
                <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-indigo-200 dark:ring-indigo-800">
                  <Image
                    src="/trevor-profile.png"
                    alt="Trevor — Software Professional and Educator"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  About the Instructor
                </h2>
                <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                  <p>
                    Hi, I&apos;m Trevor — a software professional and educator with experience working in international technical support, software development, and DevOps environments.
                  </p>
                  <p>
                    Over the past few years, I&apos;ve worked with cloud-based platforms, APIs, and modern web technologies, helping both companies and individuals solve real technical problems. My work has involved everything from debugging production systems to building full-stack applications and supporting enterprise clients in both English and Japanese.
                  </p>
                  <p>
                    What I&apos;ve learned through that experience is that the biggest gap for most learners isn&apos;t access to information — it&apos;s knowing what to focus on, how to practice effectively, and how to apply skills in real-world scenarios.
                  </p>
                  <p>
                    That&apos;s exactly what this program is designed to help with.
                  </p>
                  <p>
                    Rather than just teaching concepts, I focus on helping you build practical skills through guided projects, structured learning paths, and real coding challenges. The goal is not just to understand development, but to become confident using it in real situations.
                  </p>
                  <p>
                    Whether you&apos;re starting from scratch or leveling up your existing skills, I&apos;m here to help you move forward with clarity and purpose.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 9. TESTIMONIALS */}
      {/* ============================================ */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.testimonialsTitle')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: 'Kevin Bisner',
                role: 'Full Stack Developer',
                linkedin: 'https://www.linkedin.com/in/kevinbisner/',
                quote: 'Working with Trevor was awesome. Being new in the field of software development I needed a knowledgeable and communicative mentor who could really help me improve my skills. Trevor was exactly that. His code reviews of my projects made in SDMM showed me how to write functional, effective, and efficient code. I\'m a much better developer because of him. He is one of the people who have really helped me succeed in this field.',
              },
              {
                name: 'Brandon Chuck',
                role: 'Software Engineer',
                linkedin: 'https://www.linkedin.com/in/brandonchuck/',
                quote: 'I first met Trevor in a software development mentorship program. I was met with kindness, patience, and a tailored approach to teaching the complex world of software development. Trevor has an undeniable grasp of the fundamentals and is passionate about transferring his knowledge to his students. He always put an emphasis on gaining a deeper understanding of fundamentals like debugging, functional organization, and readability, ultimately helping us construct a developer mindset. Looking back at the program now big picture concepts were also something Trevor sought to help us understand which has always stuck with me. With his guidance and teachings I felt confident and prepared to step into my first software developer role after completing the program.',
              },
              {
                name: 'Gregory Hilger',
                role: 'Full Stack Software Developer JS | React | C# | .Net',
                linkedin: 'https://www.linkedin.com/in/gregoryhilger/',
                quote: 'I had the pleasure of working with Trevor through the SDMM online program, and I cannot speak highly enough about his expertise and friendliness. His lessons were insightful and engaging, making complex coding concepts feel accessible to beginners like me. Throughout the program Trevor showed a dedication and passion for helping others grow their skills. He always provided clear and concise explanations and would review my coding projects, offering constructive feedback that helped me learn and succeed in the program. Trevor was always knowledgeable and yet so down-to-earth, making the experience very enjoyable. I am grateful for the opportunity to learn from Trevor and I wholeheartedly recommend him as a mentor in the world of programming.',
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm flex flex-col">
                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 italic leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-auto">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{testimonial.role}</p>
                  <a
                    href={testimonial.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 rounded-md transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    View on LinkedIn
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10. PRICING / OFFER */}
      {/* ============================================ */}
      <section id="pricing" className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.pricingTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('home.pricingSubtitle')}
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Two course cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">

              {/* Foundations Course */}
              <div className="flex flex-col rounded-2xl border-2 border-green-200 dark:border-green-800/60 overflow-hidden shadow-lg">
                <div className="bg-green-600 px-6 py-5">
                  <p className="text-xs font-semibold text-green-200 uppercase tracking-wider mb-1">{t('home.pricingFoundHighlight' as any)}</p>
                  <h3 className="text-xl font-bold text-white">{t('home.pricingFoundLabel' as any)}</h3>
                </div>
                <div className="flex-1 bg-white dark:bg-dark-card p-6 flex flex-col">
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">¥150,000</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">3-{language === 'ja' ? 'ヶ月プログラム' : 'month program'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-medium">3 {language === 'ja' ? 'ヶ月' : 'months'}</span>
                    <span className="text-xs bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full font-medium">{t('home.pricingFoundProjects' as any)}</span>
                  </div>
                  <a href="#foundations" className="block w-full text-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition text-sm mb-4">
                    {language === 'ja' ? '詳しく見る' : 'Learn More'}
                  </a>
                  <a href="#contact" className="block w-full text-center px-5 py-3 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg font-semibold transition text-sm">
                    {language === 'ja' ? '無料相談を予約する' : 'Book a Free Consultation'}
                  </a>
                </div>
              </div>

              {/* Full Course */}
              <div className="flex flex-col rounded-2xl border-2 border-indigo-400 dark:border-indigo-600 overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                  <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">{t('home.pricingFullHighlight' as any)}</p>
                  <h3 className="text-xl font-bold text-white">{t('home.pricingFullLabel' as any)}</h3>
                </div>
                <div className="flex-1 bg-white dark:bg-dark-card p-6 flex flex-col">
                  <div className="mb-5">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-4xl font-extrabold text-gray-900 dark:text-white">¥200,000</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">5-{language === 'ja' ? 'ヶ月プログラム' : 'month program'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium">5 {language === 'ja' ? 'ヶ月' : 'months'}</span>
                    <span className="text-xs bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full font-medium">{t('home.pricingFullProjects' as any)}</span>
                  </div>
                  <a href="#course" className="block w-full text-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition text-sm mb-4">
                    {language === 'ja' ? '詳しく見る' : 'Learn More'}
                  </a>
                  <a href="#contact" className="block w-full text-center px-5 py-3 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-lg font-semibold transition text-sm">
                    {language === 'ja' ? '無料相談を予約する' : 'Book a Free Consultation'}
                  </a>
                </div>
              </div>
            </div>

            {/* Shared features */}
            <div className="bg-gray-50 dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-5">
                {t('home.pricingValueLabel')}
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <li key={n} className={`flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 ${n === 3 ? 'sm:col-span-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-lg px-3 py-2.5' : ''}`}>
                    <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${n === 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-500 dark:text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={n === 3 ? 'font-medium' : ''}>{t(`home.pricingFeature${n}` as any)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-dark-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  {t('home.pricingUpgrade' as any)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('home.pricingPaymentNote' as any)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 10.3. FOUNDATIONS TRACK */}
      {/* ============================================ */}
      <section id="foundations" className="py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-semibold mb-4">
              {t('home.foundBadge' as any)}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.foundTitle' as any)}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('home.foundSubtitle' as any)}
            </p>
          </div>

          {/* Overview Card */}
          <div className="max-w-5xl mx-auto mb-16 bg-gray-900 dark:bg-dark-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-8 md:p-10">
                <p className="text-gray-300 leading-relaxed text-base mb-6">
                  {t('home.foundDesc' as any)}
                </p>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-green-300 font-medium mb-8">
                  {t('home.foundUpgradeNote' as any)}
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition"
                >
                  {t('home.foundCta' as any)}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              <div className="md:col-span-2 bg-green-700 p-8 md:p-10 grid grid-cols-2 gap-6 content-center">
                {[
                  { value: t('home.foundDuration' as any), label: t('home.foundDurationLabel' as any) },
                  { value: t('home.foundPrice' as any), label: t('home.foundPriceLabel' as any) },
                  { value: t('home.foundLevel' as any), label: t('home.foundLevelLabel' as any) },
                  { value: t('home.foundProjects' as any), label: t('home.foundProjectsLabel' as any) },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-white leading-tight mb-1">{value}</div>
                    <div className="text-xs text-green-200 font-medium uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {t('home.foundLearnTitle' as any)}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: '01', title: t('home.foundModule1Title' as any),
                  items: [t('home.foundModule1Item1' as any), t('home.foundModule1Item2' as any), t('home.foundModule1Item3' as any), t('home.foundModule1Item4' as any)],
                  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                },
                {
                  num: '02', title: t('home.foundModule2Title' as any),
                  items: [t('home.foundModule2Item1' as any), t('home.foundModule2Item2' as any), t('home.foundModule2Item3' as any), t('home.foundModule2Item4' as any)],
                  color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
                },
                {
                  num: '03', title: t('home.foundModule3Title' as any),
                  items: [t('home.foundModule3Item1' as any), t('home.foundModule3Item2' as any), t('home.foundModule3Item3' as any), t('home.foundModule3Item4' as any)],
                  color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                },
              ].map(({ num, title, items, color }) => (
                <div key={num} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${color}`}>Module {num}</span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">{title}</h4>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Projects */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {t('home.foundProjectsTitle' as any)}
            </h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 italic">
              {t('home.foundProjectsNote' as any)}
            </p>
            <div className="space-y-4">
              {[
                { n: 1, title: t('home.foundProject1Title' as any), desc: t('home.foundProject1Desc' as any), tags: ['HTML', 'CSS', 'Vercel'], capstone: false },
                { n: 2, title: t('home.foundProject2Title' as any), desc: t('home.foundProject2Desc' as any), tags: ['JavaScript', 'APIs', 'DOM'], capstone: false },
                { n: 3, title: t('home.foundProject3Title' as any), desc: t('home.foundProject3Desc' as any), tags: ['JavaScript', 'React intro', 'Deployment'], capstone: true },
              ].map(({ n, title, desc, tags, capstone }) => (
                <div key={n} className={`rounded-xl border overflow-hidden ${capstone ? 'border-green-400 dark:border-green-600' : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'}`}>
                  <div className={`px-6 py-4 flex items-center gap-4 ${capstone ? 'bg-green-600' : 'bg-gray-50 dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border'}`}>
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${capstone ? 'bg-white text-green-600' : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300'}`}>{n}</span>
                    <span className={`font-semibold text-sm flex-1 ${capstone ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</span>
                    {capstone && <span className="flex-shrink-0 text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">Capstone</span>}
                  </div>
                  <div className={`px-6 py-4 ${capstone ? 'bg-green-50 dark:bg-green-900/10' : ''}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${capstone ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400'}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who This Is For */}
          <div className="max-w-4xl mx-auto mb-14">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {t('home.foundForTitle' as any)}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">This is for you</span>
                </div>
                <ul className="space-y-3">
                  {[t('home.foundFor1' as any), t('home.foundFor2' as any), t('home.foundFor3' as any), t('home.foundFor4' as any)].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">This is not for you</span>
                </div>
                <ul className="space-y-3">
                  {[t('home.foundNotFor1' as any), t('home.foundNotFor2' as any), t('home.foundNotFor3' as any), t('home.foundNotFor4' as any)].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Strip */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 md:p-10 shadow-xl">
              <p className="text-green-100 text-sm font-medium mb-2">{t('home.foundCtaNote' as any)}</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-lg font-bold hover:bg-green-50 transition shadow-lg text-lg"
              >
                {t('home.foundCta' as any)}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="text-white/90 text-base font-medium mt-6 max-w-md mx-auto leading-relaxed">
                {t('home.foundExtensionNote' as any)}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* 10.4. COURSE COMPARISON BRIDGE */}
      {/* ============================================ */}
      <div className="bg-gray-900 py-14">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest mb-8">
            {language === 'ja' ? '2つのコースを比較する' : 'Which course is right for you?'}
          </p>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-4">
            <a href="#foundations" className="group flex flex-col gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/50 rounded-xl p-6 transition">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</span>
                <span className="font-bold text-white text-base">
                  {language === 'ja' ? 'ファウンデーションズコース' : 'Foundations Course'}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {language === 'ja'
                  ? 'AIなしで、コードの一行一行を自分の手で書く。本物の基礎力を身につけるための3ヶ月。'
                  : 'You write every line yourself — no AI generating code for you. Build genuine fundamentals in 3 months.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-xs bg-green-900/40 text-green-300 px-2.5 py-1 rounded-full">3 {language === 'ja' ? 'ヶ月' : 'months'}</span>
                <span className="text-xs bg-green-900/40 text-green-300 px-2.5 py-1 rounded-full">¥150,000</span>
                <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full">{language === 'ja' ? 'コードファースト' : 'Code-first'}</span>
              </div>
            </a>
            <a href="#course" className="group flex flex-col gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-xl p-6 transition">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</span>
                <span className="font-bold text-white text-base">
                  {language === 'ja' ? 'フルコース' : 'Full Course'}
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {language === 'ja'
                  ? 'AIを日常の開発パートナーとして使いながら、フルスタックアプリを構築する5ヶ月。'
                  : 'Build full-stack apps with AI as your daily development partner from day one. 5 months.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2.5 py-1 rounded-full">5 {language === 'ja' ? 'ヶ月' : 'months'}</span>
                <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2.5 py-1 rounded-full">¥200,000</span>
                <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full">{language === 'ja' ? 'AI活用' : 'AI-powered'}</span>
              </div>
            </a>
          </div>
          <p className="text-center text-xs text-gray-600 mt-6">
            {language === 'ja'
              ? 'ファウンデーションズコース修了者はフルコースを50%オフで受講できます。'
              : 'Foundations Course graduates receive 50% off the Full Course.'}
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* 10.5. COURSE OFFERING */}
      {/* ============================================ */}
      <section id="course" className="py-24 bg-gray-50 dark:bg-dark-surface">
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
              {t('home.courseBadge')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.courseTitle')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('home.courseSubtitle')}
            </p>
          </div>

          {/* Overview Card */}
          <div className="max-w-5xl mx-auto mb-16 bg-gray-900 dark:bg-dark-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid md:grid-cols-5">
              {/* Description */}
              <div className="md:col-span-3 p-8 md:p-10">
                <p className="text-gray-300 leading-relaxed text-base mb-8">
                  {t('home.courseDesc')}
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
                >
                  {t('home.courseCta')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
              {/* Stats */}
              <div className="md:col-span-2 bg-indigo-600 p-8 md:p-10 grid grid-cols-2 gap-6 content-center">
                {[
                  { value: t('home.courseDuration'), label: t('home.courseDurationLabel') },
                  { value: t('home.coursePrice'), label: t('home.coursePriceLabel') },
                  { value: t('home.courseLevel'), label: t('home.courseLevelLabel') },
                  { value: t('home.courseProjects'), label: t('home.courseProjectsLabel') },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-white leading-tight mb-1">{value}</div>
                    <div className="text-xs text-indigo-200 font-medium uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {t('home.courseLearnTitle')}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  num: '01',
                  title: t('home.courseModule1Title'),
                  items: [
                    t('home.courseModule1Item1'),
                    t('home.courseModule1Item2'),
                    t('home.courseModule1Item3'),
                    t('home.courseModule1Item4'),
                  ],
                  color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                },
                {
                  num: '02',
                  title: t('home.courseModule2Title'),
                  items: [
                    t('home.courseModule2Item1'),
                    t('home.courseModule2Item2'),
                    t('home.courseModule2Item3'),
                    t('home.courseModule2Item4'),
                  ],
                  color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
                },
                {
                  num: '03',
                  title: t('home.courseModule3Title'),
                  items: [
                    t('home.courseModule3Item1'),
                    t('home.courseModule3Item2'),
                    t('home.courseModule3Item3'),
                    t('home.courseModule3Item4'),
                  ],
                  color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                },
              ].map(({ num, title, items, color }) => (
                <div key={num} className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-4 ${color}`}>
                    Module {num}
                  </span>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">{title}</h4>
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 5 Projects */}
          <div className="max-w-5xl mx-auto mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
              {t('home.courseProjectsTitle')}
            </h3>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 italic">
              {t('home.courseProjectsNote')}
            </p>
            <div className="space-y-4">
              {[
                { n: 1, title: t('home.courseProject1Title'), desc: t('home.courseProject1Desc'), tags: ['HTML', 'CSS', 'JavaScript'], capstone: false },
                { n: 2, title: t('home.courseProject2Title'), desc: t('home.courseProject2Desc'), tags: ['React', 'Hooks', 'State Management'], capstone: false },
                { n: 3, title: t('home.courseProject3Title'), desc: t('home.courseProject3Desc'), tags: ['Next.js', 'Database', 'Auth'], capstone: false },
                { n: 4, title: t('home.courseProject4Title'), desc: t('home.courseProject4Desc'), tags: ['APIs', 'Backend', 'Data Viz'], capstone: false },
                { n: 5, title: t('home.courseProject5Title'), desc: t('home.courseProject5Desc'), tags: ['Full-Stack', 'AI Integration', 'Deployment'], capstone: true },
              ].map(({ n, title, desc, tags, capstone }) => (
                <div
                  key={n}
                  className={`rounded-xl border overflow-hidden ${capstone ? 'border-indigo-400 dark:border-indigo-500' : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card'}`}
                >
                  <div className={`px-6 py-4 flex items-center gap-4 ${capstone ? 'bg-indigo-600' : 'bg-gray-50 dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border'}`}>
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${capstone ? 'bg-white text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300'}`}>
                      {n}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`font-semibold text-sm ${capstone ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {title}
                      </span>
                    </div>
                    {capstone && (
                      <span className="flex-shrink-0 text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                        Capstone
                      </span>
                    )}
                  </div>
                  <div className={`px-6 py-4 ${capstone ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${capstone ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400'}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capstone Spotlight */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-gray-900 dark:bg-dark-card rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/30">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-5 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold text-white">5</span>
                <div>
                  <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Final Project</p>
                  <h3 className="text-lg font-bold text-white">{t('home.courseCapstoneTitle' as any)}</h3>
                </div>
                <span className="ml-auto text-xs font-semibold bg-white/20 text-white px-2.5 py-0.5 rounded-full">Capstone</span>
              </div>
              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/10">
                <div className="p-8">
                  <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-2">{t('home.courseCapstoneSubtitle' as any)}</p>
                  <p className="text-gray-300 leading-relaxed mb-6">{t('home.courseCapstoneDesc' as any)}</p>
                  <ul className="space-y-3">
                    {([
                      t('home.courseCapstoneWhy1' as any),
                      t('home.courseCapstoneWhy2' as any),
                      t('home.courseCapstoneWhy3' as any),
                    ] as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <svg className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8">
                  <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-4">{t('home.courseCapstoneIdeasLabel' as any)}</p>
                  <div className="space-y-3">
                    {([
                      t('home.courseCapstoneIdea1' as any),
                      t('home.courseCapstoneIdea2' as any),
                      t('home.courseCapstoneIdea3' as any),
                      t('home.courseCapstoneIdea4' as any),
                    ] as string[]).map((idea, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 text-sm text-gray-300">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/50 flex items-center justify-center text-xs font-bold text-indigo-300 flex-shrink-0">{i + 1}</span>
                        {idea}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4 italic">Your actual project will reflect your own interests and goals.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Who This Is For */}
          <div className="max-w-4xl mx-auto mb-14">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {t('home.courseForTitle')}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">This is for you</span>
                </div>
                <ul className="space-y-3">
                  {[
                    t('home.courseFor1'),
                    t('home.courseFor2'),
                    t('home.courseFor3'),
                    t('home.courseFor4'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">This is not for you</span>
                </div>
                <ul className="space-y-3">
                  {[
                    t('home.courseNotFor1'),
                    t('home.courseNotFor2'),
                    t('home.courseNotFor3'),
                    t('home.courseNotFor4'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Strip */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-10 shadow-xl">
              <p className="text-indigo-200 text-sm font-medium mb-2">{t('home.courseCtaNote')}</p>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition shadow-lg text-lg"
              >
                {t('home.courseCta')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <p className="text-white/90 text-base font-medium mt-6 max-w-md mx-auto leading-relaxed">
                {t('home.courseExtensionNote' as any)}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================ */}
      {/* 11. FAQ */}
      {/* ============================================ */}
      <section id="faq" className="py-24 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4">
              {language === 'ja' ? 'よくある質問' : 'FAQ'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {language === 'ja' ? 'よくある質問' : 'Frequently Asked Questions'}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto divide-y divide-gray-200 dark:divide-dark-border">
            {faqItems.map((item, i) => (
              <div key={i}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left group"
                  aria-expanded={faqOpen === i}
                >
                  <span className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.q}
                  </span>
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${faqOpen === i ? 'border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400' : 'border-gray-300 dark:border-dark-border'}`}>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${faqOpen === i ? 'rotate-45 text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${faqOpen === i ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* 12. FINAL CTA - Schedule a Free Consultation */}
      {/* ============================================ */}
      <section id="contact" className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-purple-900 dark:to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {t('home.finalCtaTitle')}
            </h2>
            <p className="text-lg md:text-xl text-indigo-100">
              {t('home.finalCtaSubtitle')}
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20 text-center">
              <p className="text-xl font-semibold text-white mb-2">Message sent!</p>
              <p className="text-indigo-200">Thanks for getting in touch. Please check your email for an invitation to schedule your consultation with Trevor.</p>
            </div>
          ) : (
          <form
            onSubmit={handleContactSubmit}
            className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-indigo-100 mb-1.5">
                  {t('home.contactName')}
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-indigo-100 mb-1.5">
                  {t('home.contactEmail')}
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="contact-phone" className="block text-sm font-medium text-indigo-100 mb-1.5">
                {t('home.contactPhone')}
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="contact-message" className="block text-sm font-medium text-indigo-100 mb-1.5">
                {t('home.contactMessage')}
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white resize-none"
              />
            </div>
            {formStatus === 'error' && (
              <p className="text-red-300 text-sm mb-3 text-center">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={formStatus === 'loading'}
              className="w-full px-8 py-4 bg-white text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition shadow-xl text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formStatus === 'loading' ? 'Sending...' : t('home.finalCtaButton')}
            </button>
            <p className="text-center text-white/70 text-sm mt-3 font-medium">
              {t('home.finalCtaHelper' as any)}
            </p>
            <p className="text-center text-indigo-200 text-sm mt-2">
              {t('home.finalCtaSecondary')}
            </p>
          </form>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Signal Works Design</h3>
              <p className="text-sm">
                {t('home.footerTagline')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerPlatform')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">{t('home.footerFeatures')}</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">{t('home.footerHowItWorks')}</a></li>
                <li><a href="#curriculum" className="hover:text-white transition">{t('home.footerCurriculum')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerCompany')}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#about" className="hover:text-white transition">{t('home.footerAbout')}</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">{t('home.footerTestimonials')}</a></li>
                <li><a href="#faq" className="hover:text-white transition">{t('home.footerFAQ')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('home.footerContact')}</h4>
              <ul className="space-y-2 text-sm">
                <li>{t('home.footerSupport')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm space-y-3">
            <p>{t('home.footerCopyright')}</p>
            <p className="text-gray-500 text-xs max-w-2xl mx-auto leading-relaxed">
              All student reviews and testimonials displayed on this site are shared with the explicit permission of the individuals involved.
              Interactions with our AI-powered tools — including assessments, tutoring sessions, and feedback — may be used to improve and train our AI systems.
              By using this platform you acknowledge and consent to this use.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
