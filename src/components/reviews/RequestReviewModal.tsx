'use client';

import { useState } from 'react';
import axios from 'axios';

interface RequestReviewModalProps {
    onClose?: () => void;
    label?: string;
    defaultRepo?: string;
}

export default function RequestReviewModal({ onClose, label = 'Request Code Review', defaultRepo = '' }: RequestReviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [repoUrl, setRepoUrl] = useState(defaultRepo);
    const [notes, setNotes] = useState('');
    const [projectId, setProjectId] = useState('');

    const openModal = () => {
        setRepoUrl(defaultRepo); // Reset to default when opening
        setIsOpen(true);
    };
    const closeModal = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post('/api/reviews/request', {
                repoUrl,
                notes,
                projectId: projectId || undefined
            });
            alert('Review requested successfully!');
            setRepoUrl('');
            setNotes('');
            closeModal();
        } catch (error) {
            console.error(error);
            alert('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={openModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                {label}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Request Code Review</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Repository URL
                                </label>
                                <input
                                    type="url"
                                    required
                                    placeholder="https://github.com/..."
                                    value={repoUrl}
                                    onChange={(e) => setRepoUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    placeholder="What should we focus on?"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-24"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
