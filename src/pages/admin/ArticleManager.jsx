import { useState, useEffect, useRef, useCallback } from 'react';
import API, { resolveMediaUrl } from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  FileText,
  Plus,
  Trash2,
  Crown,
  Calendar,
  Tag,
  Image,
  AlertCircle,
  CheckCircle,
  X,
  MessageSquare,
  Edit,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingArticle, setEditingArticle] = useState(null);
  const fileInputRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('National');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isCharchapatraEnabled, setIsCharchapatraEnabled] = useState(false);
  const [status, setStatus] = useState('published');

  const categories = ['National', 'World', 'Technology', 'Business', 'Sports', 'Health', 'Education', 'Entertainment'];
  const acceptedImageTypes = '.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.svg';

  const fetchArticles = useCallback(async () => {
    try {
      const { data } = await API.get('/admin/articles', {
        params: { page: currentPage, limit: 10 },
      });
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setTotalArticles(data.totalArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
    setLoading(false);
  }, [currentPage]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('National');
    setImageFile(null);
    setImagePreview('');
    setIsPremium(false);
    setIsCharchapatraEnabled(false);
    setStatus('published');
    setEditingArticle(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async (articleId) => {
    try {
      const { data } = await API.get(`/articles/${articleId}`);
      setEditingArticle(data);
      setTitle(data.title);
      // Convert HTML content back to plain text for editing
      const plainContent = data.content
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .trim();
      setContent(plainContent);
      setCategory(data.category);
      setIsPremium(data.isPremium);
      setIsCharchapatraEnabled(data.isCharchapatraEnabled);
      setStatus(data.status || 'published');
      if (data.imageUrl) {
        setImagePreview(resolveMediaUrl(data.imageUrl));
      } else if (data.imagePath) {
        setImagePreview(resolveMediaUrl(data.imagePath));
      }
      setShowForm(true);
    } catch (_error) {
      setMessage({ type: 'error', text: 'Failed to load article for editing' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const htmlContent = content
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('\n');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', htmlContent);
      formData.append('category', category);
      formData.append('isPremium', isPremium);
      formData.append('isCharchapatraEnabled', isCharchapatraEnabled);
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingArticle) {
        await API.put(`/admin/articles/${editingArticle._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Article updated successfully!' });
      } else {
        await API.post('/admin/articles', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'Article created successfully!' });
      }

      resetForm();
      setShowForm(false);
      fetchArticles();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save article' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      await API.delete(`/admin/articles/${id}`);
      setArticles(articles.filter((a) => a._id !== id));
      setMessage({ type: 'success', text: 'Article deleted successfully!' });
    } catch (_error) {
      setMessage({ type: 'error', text: 'Failed to delete article' });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-primary-600" />
            Article Manager
          </h1>
          <p className="text-charcoal-500 mt-1">
            {totalArticles} article{totalArticles !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
          className={`flex items-center gap-2 ${showForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {/* Message */}
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

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card p-6 md:p-8 animate-slide-up">
          <h2 className="font-display text-xl font-bold text-charcoal-900 mb-6">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title..."
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  <Image className="w-4 h-4 inline mr-1" />
                  Article Image
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedImageTypes}
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="input-field flex items-center gap-2 cursor-pointer hover:bg-charcoal-50"
                  >
                    <Upload className="w-4 h-4 text-charcoal-400" />
                    <span className="text-charcoal-500 truncate">
                      {imageFile ? imageFile.name : 'Choose image file...'}
                    </span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-charcoal-400">
                  Accepted formats: JPEG, PNG, GIF, WebP, BMP, TIFF, SVG (Max 5MB)
                </p>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-charcoal-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here. Separate paragraphs with blank lines..."
                required
                rows={10}
                className="input-field resize-y font-serif"
              />
              <p className="mt-1 text-xs text-charcoal-400">
                Separate paragraphs with blank lines. Content will be wrapped in &lt;p&gt; tags automatically.
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                id="isPremium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isPremium" className="flex items-center gap-2 cursor-pointer">
                <Crown className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-sm font-semibold text-charcoal-800">Mark as Premium</span>
                  <p className="text-xs text-charcoal-500">Only subscribers can read the full article</p>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                id="isCharchapatraEnabled"
                checked={isCharchapatraEnabled}
                onChange={(e) => setIsCharchapatraEnabled(e.target.checked)}
                className="w-5 h-5 rounded border-charcoal-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isCharchapatraEnabled" className="flex items-center gap-2 cursor-pointer">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm font-semibold text-charcoal-800">Enable Charchapatra</span>
                  <p className="text-xs text-charcoal-500">Allow users to participate in discussions on this article</p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingArticle ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {submitting ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
              </button>
              {editingArticle && (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="btn-secondary"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Articles Table */}
      {loading ? (
        <Loader text="Loading articles..." />
      ) : (
        <>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-50 border-b border-charcoal-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Title</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Premium</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider hidden sm:table-cell">Charcha</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-charcoal-900 text-sm truncate max-w-xs">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="badge-category text-xs">{article.category}</span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {article.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-charcoal-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {article.isPremium ? (
                        <Crown className="w-5 h-5 text-amber-500 mx-auto" />
                      ) : (
                        <span className="text-charcoal-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center hidden sm:table-cell">
                      {article.isCharchapatraEnabled ? (
                        <MessageSquare className="w-5 h-5 text-blue-500 mx-auto" />
                      ) : (
                        <span className="text-charcoal-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(article._id)}
                          className="p-2 text-charcoal-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-500">No articles yet. Create your first one!</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal-300 bg-white text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                  currentPage === i + 1
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                    : 'bg-white text-charcoal-600 border border-charcoal-300 hover:bg-charcoal-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium border border-charcoal-300 bg-white text-charcoal-700 hover:bg-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default ArticleManager;
