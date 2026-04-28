import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'Forbidden: Insufficient permissions') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 max-w-md text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your account does not have admin permissions. Contact support if this is a mistake.
            </p>
            <Link
              href="/assessment"
              className="inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Back to assessment
            </Link>
          </div>
        </div>
      );
    }
    // Unauthorized — rethrow so Clerk middleware redirects to sign-in
    throw err;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">Signal Works Admin</span>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-300 hover:text-white transition">
              Students
            </Link>
          </nav>
        </div>
        <Link
          href="/assessment"
          className="text-xs text-gray-400 hover:text-gray-200 transition"
        >
          ← Back to assessment
        </Link>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
