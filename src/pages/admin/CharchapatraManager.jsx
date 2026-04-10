import { useState, useEffect } from 'react';
import API from '../../services/api';
import { resolveMediaUrl } from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  MessageSquare,
  Trash2,
  ShieldOff,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  CheckCircle,
  AlertCircle,
  Filter,
  Edit,
  X,
  Save,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const CharchapatraManager = () => {
  const [activeTab, setActiveTab] = useState('submissions');

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedSubmission, setExpandedSubmission] = useState(null);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [showReportedOnly, setShowReportedOnly] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    } else {
      fetchComments();
    }
  }, [activeTab, statusFilter, showReportedOnly]);

  // ─── Submissions ───────────────────────────────────────────────

  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await API.get(`/admin/charchapatra${params}`);
      setSubmissions(data.charchaPatras || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
    setSubmissionsLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      const { data } = await API.put(`/admin/charchapatra/${id}/approve`);
      setSubmissions(
        submissions.map((s) => (s._id === id ? data.charchaPatra : s))
      );
      showMessage('success', 'Charcha Patra approved and is now visible to the public!');
    } catch (error) {
      showMessage('error', 'Failed to approve submission');
    }
  };

  const handleReject = async (id) => {
    try {
      const { data } = await API.put(`/admin/charchapatra/${id}/reject`);
      setSubmissions(
        submissions.map((s) => (s._id === id ? data.charchaPatra : s))
      );
      showMessage('success', 'Charcha Patra rejected.');
    } catch (error) {
      showMessage('error', 'Failed to reject submission');
    }
  };

  const handleDeleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) return;
    try {
      await API.delete(`/admin/charchapatra/${id}`);
      setSubmissions(submissions.filter((s) => s._id !== id));
      showMessage('success', 'Submission deleted.');
    } catch (error) {
      showMessage('error', 'Failed to delete submission');
    }
  };

  const toggleExpanded = (id) => {
    setExpandedSubmission(expandedSubmission === id ? null : id);
  };

  // ─── Comments ──────────────────────────────────────────────────

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const params = showReportedOnly ? '?reported=true' : '';
      const { data } = await API.get(`/admin/comments${params}`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setCommentsLoading(false);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) {
      showMessage('error', 'Comment text cannot be empty');
      return;
    }
    try {
      const { data } = await API.put(`/admin/comments/${id}`, {
        text: editText.trim(),
      });
      setComments(comments.map((c) => (c._id === id ? data : c)));
      setEditingComment(null);
      setEditText('');
      showMessage('success', 'Comment updated successfully!');
    } catch (error) {
      showMessage('error', 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await API.delete(`/admin/comments/${id}`);
      setComments(comments.filter((c) => c._id !== id));
      showMessage('success', 'Comment deleted successfully!');
    } catch (error) {
      showMessage('error', 'Failed to delete comment');
    }
  };

  const handleUnflag = async (id) => {
    try {
      await API.put(`/admin/comments/${id}/unflag`);
      setComments(
        comments.map((c) =>
          c._id === id ? { ...c, isReported: false } : c
        )
      );
      showMessage('success', 'Comment flag dismissed!');
    } catch (error) {
      showMessage('error', 'Failed to dismiss flag');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await API.put(`/admin/comments/${id}`, {
        status: newStatus,
      });
      setComments(comments.map((c) => (c._id === id ? data : c)));
      showMessage('success', `Comment ${newStatus === 'active' ? 'restored' : 'updated'} successfully!`);
    } catch (error) {
      showMessage('error', 'Failed to update comment status');
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      approved: <CheckCircle className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-primary-600" />
          Charchapatra Management
        </h1>
        <p className="text-charcoal-500 mt-1">
          Manage user submissions and article comments
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-charcoal-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'submissions'
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Submissions
          {pendingCount > 0 && activeTab !== 'submissions' && (
            <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'comments'
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments
        </button>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg animate-fade-in ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* ═══ SUBMISSIONS TAB ═══ */}
      {activeTab === 'submissions' && (
        <>
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  statusFilter === status
                    ? status === 'pending'
                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                      : status === 'approved'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : status === 'rejected'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'bg-charcoal-100 text-charcoal-600 border border-charcoal-200 hover:bg-charcoal-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {submissionsLoading ? (
            <Loader text="Loading submissions..." />
          ) : (
            <div className="space-y-4">
              {submissions.length === 0 ? (
                <div className="card text-center py-12">
                  <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">
                    No {statusFilter !== 'all' ? statusFilter : ''} submissions found.
                  </p>
                </div>
              ) : (
                submissions.map((item) => (
                  <div key={item._id} className="card overflow-hidden">
                    {/* Submission Row */}
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Author & Date */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-bold">
                              {item.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-bold text-charcoal-900 truncate">
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-charcoal-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.author?.name || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(item.status)}

                          <button
                            onClick={() => toggleExpanded(item._id)}
                            className="p-2 text-charcoal-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="View details"
                          >
                            {expandedSubmission === item._id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>

                          {item.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(item._id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(item._id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {item.status === 'rejected' && (
                            <button
                              onClick={() => handleApprove(item._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Approve instead"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteSubmission(item._id)}
                            className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedSubmission === item._id && (
                      <div className="border-t border-charcoal-100 p-5 bg-charcoal-50/50 animate-fade-in">
                        <div className="flex gap-5">
                          {(item.imageUrl || item.imagePath) && (
                            <img
                              src={resolveMediaUrl(item.imageUrl || item.imagePath)}
                              alt={item.title}
                              className="w-48 h-36 object-cover rounded-xl border border-charcoal-200 flex-shrink-0"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                              {item.content}
                            </p>
                            {item.reviewedBy && (
                              <div className="mt-4 text-xs text-charcoal-400 flex items-center gap-2">
                                <Eye className="w-3 h-3" />
                                Reviewed by {item.reviewedBy?.name || 'Unknown'} on{' '}
                                {item.reviewedAt ? formatDate(item.reviewedAt) : 'N/A'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ COMMENTS TAB ═══ */}
      {activeTab === 'comments' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowReportedOnly(!showReportedOnly)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                showReportedOnly
                  ? 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                  : 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200 hover:bg-charcoal-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              {showReportedOnly ? 'Showing Reported Only' : 'Show All Comments'}
            </button>
          </div>

          {commentsLoading ? (
            <Loader text="Loading comments..." />
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-charcoal-50 border-b border-charcoal-200">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden sm:table-cell">
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden md:table-cell">
                        Article
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {comments.map((comment) => (
                      <tr
                        key={comment._id}
                        className={`hover:bg-charcoal-50 transition-colors ${
                          comment.isReported ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm text-charcoal-500 flex items-center gap-1.5 whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(comment.createdAt)}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <span className="text-sm text-charcoal-700 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            {comment.user?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-sm text-charcoal-700 flex items-center gap-1.5 truncate max-w-[200px]">
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            {comment.article?.title || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {editingComment === comment._id ? (
                            <div className="flex items-center gap-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="input-field text-sm min-w-[200px]"
                                rows={2}
                              />
                            </div>
                          ) : (
                            <p className="text-sm text-charcoal-800 line-clamp-2 max-w-xs">
                              {comment.text}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {comment.isReported ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                              <AlertTriangle className="w-3 h-3" />
                              Reported
                            </span>
                          ) : comment.status === 'deleted' ? (
                            <button
                              onClick={() => handleStatusChange(comment._id, 'active')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-charcoal-100 text-charcoal-500 hover:bg-green-100 hover:text-green-700 transition-colors cursor-pointer"
                              title="Click to restore"
                            >
                              Deleted
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {editingComment === comment._id ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(comment._id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                  title="Save changes"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(comment)}
                                  className="p-2 text-charcoal-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit comment"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                {comment.isReported && (
                                  <button
                                    onClick={() => handleUnflag(comment._id)}
                                    className="p-2 text-charcoal-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="Dismiss flag"
                                  >
                                    <ShieldOff className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {comments.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">
                    {showReportedOnly
                      ? 'No reported comments found.'
                      : 'No comments yet.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CharchapatraManager;
