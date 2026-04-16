import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API, { resolveMediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/Loader';
import {
  ArrowLeft,
  Clock,
  Crown,
  Lock,
  Sparkles,
  Tag,
} from 'lucide-react';
import CommentSection from '../components/CommentSection';

const ArticleView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await API.get(`/articles/${id}`);
        setArticle(data);
      } catch (_err) {
        setError('Article not found');
      }
      setLoading(false);
    };
    fetchArticle();
  }, [id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <Loader text="Loading article..." />;

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal-800 mb-4">{error || 'Article not found'}</h2>
          <Link to="/" className="btn-primary">
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const featuredImage =
    resolveMediaUrl(article.imageUrl) ||
    resolveMediaUrl(article.imagePath);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-charcoal-500 hover:text-primary-600 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all articles
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="badge-category">
            <Tag className="w-3 h-3" />
            {article.category}
          </span>
          {article.isPremium && (
            <span className="badge-premium">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          <span className="flex items-center gap-1.5 text-charcoal-500 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 leading-tight mb-8 text-balance">
          {article.title}
        </h1>

        {/* Featured Image */}
        {featuredImage && (
          <div className="relative rounded-2xl overflow-hidden mb-10 shadow-xl">
            <img
              src={featuredImage}
              alt={article.title}
              className="w-full aspect-[21/9] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none text-charcoal-800
                     prose-headings:font-display prose-headings:text-charcoal-900
                     prose-p:mb-6 prose-p:text-charcoal-700 prose-p:leading-[1.9]
                     prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-charcoal-900
                     prose-li:my-2
                     font-serif"
          style={{
            lineHeight: '1.9',
            wordSpacing: '0.03em',
            letterSpacing: '0.01em',
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Premium Gating Banner */}
        {article.isContentTruncated && (
          <div className="relative mt-8">
            {/* Fade overlay on truncated content */}
            <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

            <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-primary-900 rounded-2xl p-8 md:p-12 text-white text-center shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-6 shadow-lg">
                <Lock className="w-8 h-8 text-amber-900" />
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Subscribe to Continue Reading
              </h3>
              <p className="text-charcoal-300 text-lg mb-8 max-w-md mx-auto">
                This is a premium article. Subscribe to unlock unlimited access to all our premium content.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/subscribe"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 font-bold px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5" />
                  Subscribe Now
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="text-charcoal-300 hover:text-white transition-colors font-medium"
                  >
                    Already subscribed? Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Charchapatra Comment Section */}
        <CommentSection
          articleId={id}
          isEnabled={article.isCharchapatraEnabled}
        />
      </article>
    </div>
  );
};

export default ArticleView;
