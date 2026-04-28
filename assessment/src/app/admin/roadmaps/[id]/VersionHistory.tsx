'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Version {
  id: string;
  version: number;
  editedAt: string;
  editedBy: string;
  editNote: string | null;
}

interface Props {
  roadmapId: string;
}

export default function VersionHistory({ roadmapId }: Props) {
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/roadmaps/${roadmapId}/versions`)
      .then((r) => r.json())
      .then((data) => {
        setVersions(data.versions ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [roadmapId]);

  async function handleRestore(versionId: string) {
    setRestoring(versionId);
    setConfirmId(null);
    try {
      const res = await fetch(
        `/api/admin/roadmaps/${roadmapId}/versions/${versionId}/restore`,
        { method: 'POST' }
      );
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setRestoring(null);
    }
  }

  if (loading) return null;
  if (versions.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Version History</h2>
      <div className="space-y-2">
        {versions.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-start justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  v{v.version}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(v.editedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC',
                    timeZoneName: 'short',
                  })}
                </span>
                <span className="text-xs text-gray-400">by {v.editedBy}</span>
              </div>
              {v.editNote && (
                <p className="text-sm text-gray-600 truncate max-w-xl" title={v.editNote}>
                  &ldquo;{v.editNote}&rdquo;
                </p>
              )}
            </div>

            <div className="shrink-0">
              {confirmId === v.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Restore this version?</span>
                  <button
                    onClick={() => handleRestore(v.id)}
                    disabled={restoring === v.id}
                    className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition disabled:opacity-50"
                  >
                    {restoring === v.id ? 'Restoring…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(v.id)}
                  className="text-xs font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1 rounded-lg transition"
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
