'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface LessonViewProps {
  lessonId: string;
  courseId: string;
}

interface ContextChunk {
  id: string;
  content: string;
  chunkIndex: number;
}

export default function LessonView({ lessonId, courseId }: LessonViewProps) {
  const [lesson, setLesson] = useState<any>(null);
  const [contextChunks, setContextChunks] = useState<ContextChunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContext, setShowContext] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  useEffect(() => {
    // Fetch lesson data
    // TODO: Implement lesson fetching via API
    // For now, mock data
    setLesson({
      id: lessonId,
      title: 'Sample Lesson',
      content: 'This is the lesson content. In a real implementation, this would be fetched from the API and could include markdown, videos, and interactive elements.',
      videoUrl: null,
      duration: 30,
    });

    // Fetch lesson context chunks
    fetch(`/api/knowledge/lesson/${lessonId}`)
      .then((res) => res.json())
      .then((data) => {
        setContextChunks(data.chunks || []);
      })
      .catch((err) => {
        console.error('Failed to fetch lesson context:', err);
      });

    setLoading(false);
  }, [lessonId]);

  const fetchDebugContext = async () => {
    console.log('Fetching lesson context for lessonId:', lessonId);
    try {
      const response = await fetch(`/api/knowledge/lesson/${lessonId}`);
      const data = await response.json();
      console.log('Lesson context response:', data);
      setDebugData({
        timestamp: new Date().toISOString(),
        lessonId,
        response: data,
        chunkCount: data.chunks?.length || 0,
      });
      setShowDebug(true);
    } catch (error) {
      console.error('Failed to fetch debug context:', error);
      setDebugData({
        timestamp: new Date().toISOString(),
        lessonId,
        error: String(error),
      });
      setShowDebug(true);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading lesson...</div>;
  }

  if (!lesson) {
    return <div className="text-center py-12 text-red-600">Lesson not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-4">
          <Link href={`/courses/${courseId}`} className="text-indigo-600 hover:underline">
            &larr; Back to Course
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

        {lesson.videoUrl && (
          <div className="mb-6">
            <video controls className="w-full rounded-lg" src={lesson.videoUrl} />
          </div>
        )}

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
        </div>

        {/* RAG Context Section */}
        {contextChunks.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <button
              onClick={() => setShowContext(!showContext)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Lesson Resources ({contextChunks.length})
              </h3>
              <span className="text-gray-500">
                {showContext ? '▼' : '▶'}
              </span>
            </button>

            {showContext && (
              <div className="mt-4 space-y-3">
                {contextChunks.map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      Resource {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t flex gap-4">
          <Link
            href="/assessment"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Practice with AI Assessment
          </Link>

          <button
            onClick={fetchDebugContext}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Show Lesson Context (Debug)
          </button>
        </div>
        </div>
      </div>

      {/* Debug Sidebar */}
      {showDebug && debugData && (
        <div className="w-96 bg-white rounded-lg shadow-md p-6 max-h-screen overflow-y-auto sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Debug: Lesson Context</h3>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Metadata */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 mb-2">METADATA</div>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Lesson ID:</span> {debugData.lessonId}</div>
                <div><span className="font-medium">Timestamp:</span> {debugData.timestamp}</div>
                <div><span className="font-medium">Chunk Count:</span> {debugData.chunkCount}</div>
              </div>
            </div>

            {/* Error Display */}
            {debugData.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-xs font-semibold text-red-600 mb-2">ERROR</div>
                <div className="text-sm text-red-700">{debugData.error}</div>
              </div>
            )}

            {/* Chunks Display */}
            {debugData.response?.chunks && debugData.response.chunks.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2">CHUNKS</div>
                <div className="space-y-3">
                  {debugData.response.chunks.map((chunk: any, idx: number) => (
                    <div key={chunk.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">
                        Chunk {idx + 1} (Index: {chunk.chunkIndex})
                      </div>
                      <div className="text-xs text-gray-700 mb-2 line-clamp-4">
                        {chunk.content}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {chunk.id.slice(0, 12)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Chunks Message */}
            {debugData.response?.chunks && debugData.response.chunks.length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-yellow-700">
                  No context chunks found for this lesson. Documents may not be indexed yet.
                </div>
              </div>
            )}

            {/* Raw JSON */}
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2">RAW JSON</div>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(debugData.response, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
