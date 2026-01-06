'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import RequestReviewModal from './RequestReviewModal';

interface ReviewRequest {
    id: string;
    repoUrl: string;
    projectId?: string;
    notes?: string;
    status: 'PENDING' | 'IN_REVIEW' | 'COMPLETED' | 'CLOSED' | 'REJECTED';
    feedback?: string;
    createdAt: string;
    reviewer?: {
        name: string;
        avatarUrl: string;
    };
}

export default function StudentReviewStatus() {
    const [reviews, setReviews] = useState<ReviewRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/api/reviews/mine');
                if (res.data.success) {
                    setReviews(res.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [refreshTrigger]);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    if (loading && reviews.length === 0) return null;
    if (reviews.length === 0) return null;

    // Show only the most recent ACTIVE or UNREAD outcome
    const activeReview = reviews[0]; // Assuming sorted by newest first

    if (!activeReview) return null;

    return (
        <div className="h-full bg-white dark:bg-dark-card rounded-xl shadow-md p-6 border border-gray-100 dark:border-dark-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Review Status
                    {activeReview.status === 'PENDING' && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-normal">Pending</span>}
                    {activeReview.status === 'IN_REVIEW' && <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-normal">In Review</span>}
                    {activeReview.status === 'REJECTED' && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-normal">Action Required</span>}
                    {activeReview.status === 'COMPLETED' && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-normal">Completed</span>}
                </h3>
                <button onClick={refresh} className="text-gray-400 hover:text-gray-600">
                    <RefreshCw size={16} />
                </button>
            </div>

            <div className="flex items-start gap-3">
                {activeReview.status === 'REJECTED' ? (
                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                        <AlertCircle size={24} />
                    </div>
                ) : activeReview.status === 'COMPLETED' ? (
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                        <CheckCircle size={24} />
                    </div>
                ) : (
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <Clock size={24} />
                    </div>
                )}

                <div className="flex-1">
                    <p className="text-lg text-gray-900 dark:text-white font-medium mb-1">
                        {activeReview.repoUrl.split('/').pop()}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                        Submitted {formatDistanceToNow(new Date(activeReview.createdAt))} ago
                    </p>

                    {activeReview.feedback && (
                        <div className={`text-sm p-3 rounded-md mb-4 ${activeReview.status === 'REJECTED'
                            ? 'bg-red-50 text-red-800 border border-red-100'
                            : 'bg-green-50 text-green-800 border border-green-100'
                            }`}>
                            <p className="font-semibold text-xs uppercase mb-1">Instructor Feedback:</p>
                            "{activeReview.feedback}"
                        </div>
                    )}

                    {activeReview.status === 'REJECTED' && (
                        <div className="flex justify-end">
                            <RequestReviewModal
                                onClose={refresh}
                                label="Resubmit for Review"
                                defaultRepo={activeReview.repoUrl}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
