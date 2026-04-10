import { useState, useEffect } from 'react';
import API, { resolveMediaUrl } from '../services/api';
import { Loader } from '../components/Loader';
import {
  FileText,
  Calendar,
  Download,
  ExternalLink,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const EPapers = () => {
  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEPapers = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get('/epapers', {
          params: { page: currentPage, limit: 6 },
        });
        setEpapers(data.epapers);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error('Error fetching e-papers:', error);
        setError('Could not load e-papers. Please check backend/server connection and retry.');
      }
      setLoading(false);
    };
    fetchEPapers();
  }, [currentPage]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
    };
  };

  const getPdfUrl = (epaper) => {
    return resolveMediaUrl(epaper.pdfUrl || epaper.pdfPath);
  };

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-primary-400" />
            <span className="text-primary-300 text-sm font-semibold uppercase tracking-wider">
              Digital Editions
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-4">
            E-Paper Archive
          </h1>
          <p className="text-charcoal-300 text-lg max-w-2xl">
            Access our digital newspaper editions. Read the full paper in PDF format,
            just like the print edition.
          </p>
        </div>
      </section>

      {/* E-Papers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <Loader text="Loading e-papers..." />
        ) : error ? (
          <div className="text-center py-20">
            <Newspaper className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-charcoal-700 mb-2">
              Unable to load E-Papers
            </h3>
            <p className="text-charcoal-500 mb-5">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Retry
            </button>
          </div>
        ) : epapers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {epapers.map((epaper, index) => {
                const dateObj = formatShortDate(epaper.publishDate);
                return (
                  <div
                    key={epaper._id}
                    className="card-hover p-6 flex items-start gap-5 animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
                  >
                    {/* Date Badge */}
                    <div className="flex-shrink-0 w-16 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
                      <span className="text-2xl font-bold leading-none">{dateObj.day}</span>
                      <span className="text-xs font-medium uppercase mt-1">{dateObj.month}</span>
                      <span className="text-[10px] opacity-70">{dateObj.year}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-charcoal-900 mb-1 truncate">
                        {epaper.title}
                      </h3>
                      <p className="text-sm text-charcoal-500 flex items-center gap-1.5 mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(epaper.publishDate)}
                      </p>
                      <a
                        href={getPdfUrl(epaper)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold group"
                      >
                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                        View PDF
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
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
              No E-Papers Available
            </h3>
            <p className="text-charcoal-500">
              Check back later for new editions.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default EPapers;
