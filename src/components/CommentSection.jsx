import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  MessageSquare,
  Send,
  Flag,
  LogIn,
  AlertCircle,
  CheckCircle,
  User,
  Clock,
} from 'lucide-react';

const CommentSection = ({ articleId, isEnabled }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEnabled) {
      fetchComments();
    }
  }, [articleId, isEnabled]);

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/articles/${articleId}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
    setLoading(false);
  };

  const showToast = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getWordCount = (str) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    const wordCount = getWordCount(text);
    if (wordCount > 600) {
      showToast('error', 'Comment cannot exceed 600 words');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post(`/articles/${articleId}/comments`, {
        text: text.trim(),
      });
      setComments([data, ...comments]);
      setText('');
      showToast('success', 'Comment submitted successfully!');
    } catch (error) {
      showToast(
        'error',
        error.response?.data?.message || 'Failed to submit comment'
      );
    }
    setSubmitting(false);
  };

  const handleReport = async (commentId) => {
    try {
      await API.post(`/comments/${commentId}/report`);
      showToast('success', 'Comment reported to admin');
    } catch (error) {
      showToast('error', 'Failed to report comment');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isEnabled) return null;

  return (
    <div className="mt-12 border-t border-charcoal-200 pt-10">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900">
            Charchapatra
          </h2>
          <p className="text-sm text-charcoal-500">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Toast Message */}
      {message.text && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 animate-fade-in ${
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

      {/* Comment Form or Login Prompt */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="card p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-charcoal-700">
                Commenting as {user.name}
              </span>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts on this article..."
              rows={4}
              className="input-field resize-y mb-3 font-serif"
              maxLength={3600}
            />

            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${
                  getWordCount(text) > 550
                    ? getWordCount(text) > 600
                      ? 'text-red-500 font-semibold'
                      : 'text-amber-500'
                    : 'text-charcoal-400'
                }`}
              >
                {getWordCount(text)} / 600 words
              </span>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="card p-6 md:p-8 text-center mb-8 bg-charcoal-50 border-dashed border-2 border-charcoal-200">
          <LogIn className="w-10 h-10 text-charcoal-400 mx-auto mb-3" />
          <p className="text-charcoal-600 font-medium mb-3">
            Please log in to participate in the Charcha.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <LogIn className="w-4 h-4" />
            Log In
          </Link>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-charcoal-300 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
          <p className="text-charcoal-500">
            No comments yet. Be the first to start the conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="card p-4 md:p-5 hover:shadow-md transition-shadow animate-fade-in"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-charcoal-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {comment.user?.name || 'User'}
                      </span>
                      <span className="text-xs text-charcoal-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-charcoal-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {/* Report button — only show if logged in and not own comment */}
                {user && comment.user?._id !== user._id && (
                  <button
                    onClick={() => handleReport(comment._id)}
                    className="p-2 text-charcoal-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                    title="Report comment"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
