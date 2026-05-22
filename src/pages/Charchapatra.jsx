import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { resolveMediaUrl } from '../services/api';
import { Loader } from '../components/Loader';
import ArticleCard from '../components/ArticleCard';
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Send,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Image as ImageIcon,
  LogIn,
} from 'lucide-react';

const Charchapatra = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [latestComments, setLatestComments] = useState([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submit form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setError('');
    try {
      // Fetch article-linked charchapatra
      const articlesRes = API.get('/articles', {
        params: { charchapatra: true, page: 1, limit: 50 },
      });

      // Fetch approved user submissions
      const submissionsRes = API.get('/charchapatra', {
        params: { page: 1, limit: 50 },
      });

      const [artData, subData] = await Promise.all([articlesRes, submissionsRes]);

      const charchaArticles = Array.isArray(artData.data?.articles) ? artData.data.articles : [];
      setArticles(charchaArticles);

      const submissions = Array.isArray(subData.data?.charchaPatras) ? subData.data.charchaPatras : [];
      setApprovedSubmissions(submissions);

      // Fetch latest comments from articles
      const commentPromises = charchaArticles.slice(0, 5).map((article) =>
        API.get(`/articles/${article._id}/comments`).then((res) => ({
          articleId: article._id,
          articleTitle: article.title,
          comments: res.data.slice(0, 2),
        }))
      );
      const results = await Promise.all(commentPromises);
      const allComments = results
        .flatMap((r) =>
          r.comments.map((c) => ({
            ...c,
            articleId: r.articleId,
            articleTitle: r.articleTitle,
          }))
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      setLatestComments(allComments);
    } catch (error) {
      console.error('Error fetching charchapatra data:', error);
      setError('Could not load discussions. Please verify backend connection and try again.');
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (image) {
        formData.append('image', image);
      }

      await API.post('/charchapatra', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage({
        type: 'success',
        text: 'Your Charcha Patra has been submitted! It will be visible after approval by admin/employee.',
      });
      setTitle('');
      setContent('');
      setImage(null);
      setImagePreview('');
      setShowForm(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to submit. Please try again.',
      });
    }
    setSubmitting(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 6000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateLong = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <Loader text="Loading discussions..." />;

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-6 shadow-lg shadow-primary-600/30">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-balance">
              Charchapatra
            </h1>
            <p className="text-charcoal-300 text-lg max-w-2xl mx-auto mb-8">
              Join the conversation. Share your thoughts and perspectives on the stories that matter.
            </p>

            {/* Submit Button */}
            {user ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5" />
                {showForm ? 'Close Form' : 'Submit Charcha Patra'}
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <LogIn className="w-5 h-5" />
                Login to Submit Charcha Patra
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Message Toast */}
        {message.text && (
          <div
            className={`flex items-start gap-3 px-5 py-4 rounded-xl mb-8 animate-fade-in ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Submit Form */}
        {showForm && user && (
          <div className="card p-6 md:p-8 mb-10 animate-fade-in">
            <h2 className="font-display text-xl font-bold text-charcoal-900 mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-600" />
              Submit Your Charcha Patra
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your discussion a title..."
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts, opinions or discussion topic..."
                  className="input-field min-h-[150px]"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Attach Image (optional)
                </label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-40 h-32 object-cover rounded-xl border-2 border-charcoal-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-charcoal-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-all">
                    <ImageIcon className="w-5 h-5 text-charcoal-400" />
                    <span className="text-sm text-charcoal-500">Click to upload an image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit for Review
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-charcoal-400">
                * Your submission will be reviewed by an admin or employee before it appears publicly.
              </p>
            </form>
          </div>
        )}

        {/* Approved User Submissions Section */}
        {approvedSubmissions.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-600" />
              Community Discussions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedSubmissions.map((item) => (
                <div
                  key={item._id}
                  className="card p-5 hover:-translate-y-1 transition-all duration-300"
                >
                  {(item.imageUrl || item.imagePath) && (
                    <img
                      src={resolveMediaUrl(item.imageUrl || item.imagePath)}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="font-display text-lg font-bold text-charcoal-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-600 line-clamp-3 mb-4">
                    {item.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-charcoal-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                          {item.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="font-medium text-charcoal-600">
                        {item.author?.name || 'User'}
                      </span>
                    </div>
                    <span>{formatDateLong(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Discussions Section (Comments) */}
        {latestComments.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary-600" />
              Latest Discussions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestComments.map((comment) => (
                <Link
                  key={comment._id}
                  to={`/article/${comment.articleId}`}
                  className="card p-5 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-charcoal-800">
                          {comment.user?.name || 'User'}
                        </span>
                        <span className="text-xs text-charcoal-400">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal-600 line-clamp-2 mb-2">
                        {comment.text}
                      </p>
                      <span className="text-xs text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        on: {comment.articleTitle?.substring(0, 40)}
                        {comment.articleTitle?.length > 40 ? '...' : ''}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Articles with Discussions */}
        <div>
          <h2 className="font-display text-2xl font-bold text-charcoal-900 mb-6 flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            Articles Open for Discussion
          </h2>

          {articles.length === 0 && approvedSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-charcoal-700 mb-2">
                {error ? 'Unable to load discussions' : 'No discussions yet'}
              </h3>
              <p className="text-charcoal-500">
                {error || 'Check back soon — discussions will be enabled on select articles.'}
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-charcoal-500">
                No articles are currently open for discussion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <ArticleCard key={article._id} article={article} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charchapatra;
