'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  roadmapId: string;
}

export default function EditRoadmapPanel({ roadmapId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!instruction.trim()) return;
    setState('loading');
    setError(null);
    try {
      const res = await fetch(`/api/admin/roadmaps/${roadmapId}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? 'AI edit failed. Please try again.');
        setState('error');
        return;
      }
      setOpen(false);
      setInstruction('');
      setState('idle');
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
      setState('error');
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-3 py-1.5 rounded-lg transition"
      >
        {open ? 'Cancel edit' : 'Edit with AI'}
      </button>

      {open && (
        <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-indigo-900 mb-1">AI Roadmap Edit</h3>
          <p className="text-xs text-indigo-600 mb-3">
            Describe what you want changed. The current roadmap will be saved as a version before applying edits.
          </p>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={4}
            placeholder='e.g. "Shorten phase 2 to 2 weeks and add more focus on React hooks. Replace project 3 with a billing dashboard."'
            className="w-full text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            disabled={state === 'loading'}
          />
          {error && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-1.5">
              {error}
            </p>
          )}
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={!instruction.trim() || state === 'loading'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === 'loading' && (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              )}
              {state === 'loading' ? 'Generating…' : 'Generate update'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
