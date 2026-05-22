import { Link } from 'react-router-dom';
import { Crown, Clock, ArrowRight } from 'lucide-react';
import { resolveMediaUrl } from '../services/api';

const ArticleCard = ({ article, index }) => {
  const imageSrc =
    resolveMediaUrl(article.imageUrl) ||
    resolveMediaUrl(article.imagePath) ||
    'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=800';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link
      to={`/article/${article._id}`}
      className="card-hover group overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <img
          src={imageSrc}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {article.isPremium && (
            <span className="badge-premium shadow-md">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          <span className="badge-category bg-white/90 backdrop-blur-sm shadow-sm">
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-charcoal-900 leading-tight mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-charcoal-500 text-sm">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(article.publishedAt)}
          </div>

          <span className="flex items-center gap-1 text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
