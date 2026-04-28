'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteRoadmapButton({ roadmapId, studentName }: { roadmapId: string; studentName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/roadmaps/${roadmapId}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setLoading(false);
      setConfirming(false);
      alert('Failed to delete roadmap. Please try again.');
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Delete {studentName}&apos;s roadmap?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition"
        >
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm font-medium text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition"
    >
      Delete &amp; reset student
    </button>
  );
}
