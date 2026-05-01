import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import CalEmbed from '@/modules/consultation/CalEmbed';

interface Props {
  searchParams: { token?: string };
}

export default async function BookingPage({ searchParams }: Props) {
  const { token } = searchParams;

  if (!token) {
    redirect('/?error=missing-token');
  }

  const invite = await prisma.consultationInvite.findUnique({
    where: { token },
    select: { name: true, email: true, status: true, expiresAt: true },
  });

  if (!invite) {
    redirect('/?error=invalid-token');
  }

  if (new Date() > invite.expiresAt) {
    redirect('/?error=expired-token');
  }

  const displayName = invite.name ?? '';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-lg">Signal Works Design</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">

        {/* Intro */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {displayName ? `Book your consultation, ${displayName.split(' ')[0]}` : 'Book your consultation'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-lg">
            Choose a time that works for you. This is a free 30-minute session where we&apos;ll
            discuss your goals, review your results, and map out your next steps.
          </p>
        </div>

        {/* What to expect */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">What we&apos;ll cover</p>
          <ul className="space-y-2">
            {[
              'Your background and what you want to build',
              'Which course (Foundations or Full) is the right fit',
              'Your personalized roadmap and first steps',
              'Any questions you have about the program',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Cal.com Embed */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden min-h-[600px]">
          <CalEmbed name={displayName} email={invite.email} />
        </div>

      </div>
    </main>
  );
}
