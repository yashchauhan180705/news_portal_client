import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import ArticleCard from '../components/ArticleCard';
import { ArticleSkeleton } from '../components/Loader';
import {
  Newspaper,
  TrendingUp,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = ['all', 'National', 'World', 'Technology', 'Business', 'Sports', 'Health', 'Education', 'Entertainment'];

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [error, setError] = useState('');

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: currentPage, limit: 6 };
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      const { data } = await API.get('/articles', { params });
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setTotalArticles(data.totalArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError('Could not load articles. Please check backend/server connection and refresh.');
    }
    setLoading(false);
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-400" />
              <span className="text-primary-300 text-sm font-semibold uppercase tracking-wider">
                Trending Today
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance mb-6">
              Stay Informed with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-red-300">
                {' '}Quality Journalism
              </span>
            </h1>
            <p className="text-charcoal-300 text-lg md:text-xl leading-relaxed max-w-2xl">
              Your trusted source for breaking news, in-depth analysis,
              and comprehensive coverage of the stories that shape our world.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-charcoal-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white/15 transition-all"
                />
              </div>
              <button type="submit" className="btn-primary rounded-xl px-6 shadow-lg shadow-primary-600/30">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-40 bg-white border-b border-charcoal-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            <Filter className="w-4 h-4 text-charcoal-500 flex-shrink-0" />
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
                }`}
              >
                {cat === 'all' ? 'All News' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6 text-primary-600" />
            <h2 className="font-display text-2xl font-bold text-charcoal-900">
              {selectedCategory === 'all' ? 'Latest News' : selectedCategory}
            </h2>
          </div>
          <span className="text-sm text-charcoal-500">
            {totalArticles} article{totalArticles !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
              Unable to load articles
            </h3>
            <p className="text-charcoal-500 mb-5">{error}</p>
            <button onClick={fetchArticles} className="btn-primary">
              Retry
            </button>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article, index) => (
                <ArticleCard key={article._id} article={article} index={index} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
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
        ) : (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
              No articles found
            </h3>
            <p className="text-charcoal-500">
              Try changing the category or search term.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
