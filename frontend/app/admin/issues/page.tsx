'use client';

import { useState, useEffect } from 'react';
import { adminApi, getApiError, issuesApi } from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Issue {
  _id: string;
  orderId: {
    _id: string;
    orderNumber: string;
    orderStatus: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  adminNotes?: string;
  createdAt: string;
}

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    loadIssues();
  }, [page]);

  const loadIssues = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.getIssues({ page, limit: 10 });
      setIssues(res.data.data.issues);
      setTotalPages(res.data.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await issuesApi.updateIssue(id, { status: newStatus });
      toast.success('Status updated');
      setIssues(issues.map(i => i._id === id ? { ...i, status: newStatus as any } : i));
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  const handleNotesUpdate = async (id: string, notes: string) => {
    try {
      await issuesApi.updateIssue(id, { adminNotes: notes });
      toast.success('Notes saved');
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Support Requests</h1>
          <p className="text-gray-500 mt-1">Manage B2B order issues and return requests.</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Order / User</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 w-48">Admin Notes</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {issues.map((issue) => (
                <tr key={issue._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">#{issue.orderId.orderNumber}</p>
                    <p className="text-xs text-gray-500">{issue.userId.name}</p>
                    <p className="text-xs text-gray-400">{issue.userId.email}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-200 font-medium">{issue.subject}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-md whitespace-pre-wrap">{issue.message}</td>
                  <td className="px-6 py-4">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-2 py-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <textarea
                      defaultValue={issue.adminNotes || ''}
                      onBlur={(e) => {
                        if (e.target.value !== issue.adminNotes) {
                          handleNotesUpdate(issue._id, e.target.value);
                          issue.adminNotes = e.target.value;
                        }
                      }}
                      placeholder="Add notes..."
                      className="w-full text-xs p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded resize-y min-h-[40px] focus:ring-primary-500 focus:border-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(issue.createdAt)}</td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No support requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
}
