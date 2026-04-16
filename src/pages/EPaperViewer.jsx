import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  FileText,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';

const EPaperViewer = () => {
  const [searchParams] = useSearchParams();
  const pdfUrl = searchParams.get('url');
  const title = searchParams.get('title') || 'E-Paper';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Use Google Docs Viewer as fallback for Cloudinary PDFs that force download
  const getViewerUrl = (url) => {
    if (!url) return '';
    // For Cloudinary URLs, modify the URL to force inline display
    if (url.includes('cloudinary.com')) {
      // Add fl_attachment:false or use Google Docs viewer
      const encodedUrl = encodeURIComponent(url);
      return `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
    }
    // For other URLs, try direct embed
    return url;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Reset error state when URL changes
    setLoadError(false);
  }, [pdfUrl]);

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-charcoal-800 mb-4">
            No PDF specified
          </h2>
          <Link to="/epapers" className="btn-primary">
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to E-Papers
          </Link>
        </div>
      </div>
    );
  }

  const viewerUrl = getViewerUrl(pdfUrl);

  return (
    <div
      className={`bg-charcoal-900 ${
        isFullscreen
          ? 'fixed inset-0 z-50'
          : 'min-h-screen'
      }`}
    >
      {/* Toolbar */}
      <div className="bg-charcoal-800 border-b border-charcoal-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/epapers"
              className="flex items-center gap-2 text-charcoal-300 hover:text-white transition-colors text-sm font-medium flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-5 w-px bg-charcoal-600 flex-shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-primary-400 flex-shrink-0" />
              <h1 className="text-white font-semibold truncate text-sm sm:text-base">
                {title}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-charcoal-300 hover:text-white hover:bg-charcoal-700 transition-all text-sm font-medium"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all text-sm font-semibold shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className={`w-full ${
          isFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[calc(100vh-120px)]'
        }`}
      >
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <AlertCircle className="w-16 h-16 text-charcoal-500 mb-4" />
            <h3 className="text-xl font-semibold text-charcoal-300 mb-2">
              Unable to preview PDF
            </h3>
            <p className="text-charcoal-400 mb-6 max-w-md">
              The PDF could not be loaded in the viewer. You can still download
              it using the button below.
            </p>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all font-semibold shadow-md"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </button>
          </div>
        ) : (
          <iframe
            src={viewerUrl}
            title={title}
            className="w-full h-full border-0"
            onError={() => setLoadError(true)}
          />
        )}
      </div>
    </div>
  );
};

export default EPaperViewer;
