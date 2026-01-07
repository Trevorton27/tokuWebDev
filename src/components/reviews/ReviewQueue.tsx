'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ReviewRequest {
    id: string;
    repoUrl: string;
    notes?: string;
    status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'CLOSED';
    createdAt: string;
    user: {
        name: string | null;
        email: string;
        avatarUrl: string | null;
    };
}

export default function ReviewQueue() {
    const { t } = useLanguage();
    const [requests, setRequests] = useState<ReviewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/reviews/pending');
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string, reviewFeedback?: string) => {
        try {
            await axios.patch(`/api/reviews/${id}`, {
                status: newStatus,
                feedback: reviewFeedback
            });
            fetchRequests(); // Refresh list
            setRejectingId(null);
            setFeedback('');
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(t('instructor.failedToUpdateStatus'));
        }
    };

    if (loading) return <div className="text-center py-4">{t('common.loading')}</div>;
    if (requests.length === 0) return <div className="text-center py-4 text-gray-500">{t('instructor.noPendingReviews')}</div>;

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('instructor.pendingCodeReviews')}</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {requests.map((req) => (
                    <div key={req.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {req.user.name?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{req.user.name || req.user.email}</p>
                                    <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(req.createdAt))} {t('student.ago')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {req.status === 'IN_REVIEW' ? t('instructor.statusInReview') :
                                        req.status === 'PENDING' ? t('instructor.statusPending') :
                                            req.status === 'COMPLETED' ? t('instructor.statusCompleted') :
                                                req.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="ml-10">
                            <a
                                href={req.repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium mb-1"
                            >
                                <ExternalLink size={14} />
                                {req.repoUrl}
                            </a>
                            {req.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                    "{req.notes}"
                                </p>
                            )}

                            <div className="flex gap-2 mt-2">
                                {req.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdateStatus(req.id, 'IN_REVIEW')}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded border border-yellow-200"
                                    >
                                        <Clock size={12} />
                                        {t('instructor.startReview')}
                                    </button>
                                )}

                                {rejectingId === req.id ? (
                                    <div className="flex-1 mt-2">
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder={t('instructor.rejectionReason')}
                                            className="w-full text-sm p-2 border rounded mb-2"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, 'REJECTED', feedback)}
                                                className="px-3 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded"
                                            >
                                                {t('instructor.confirmReject')}
                                            </button>
                                            <button
                                                onClick={() => setRejectingId(null)}
                                                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200"
                                        >
                                            <CheckCircle size={12} />
                                            {t('instructor.approve')}
                                        </button>
                                        <button
                                            onClick={() => setRejectingId(req.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200"
                                        >
                                            <XCircle size={12} />
                                            {t('instructor.reject')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
