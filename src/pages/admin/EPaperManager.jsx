import { useState, useEffect, useRef } from 'react';
import API, { resolveMediaUrl } from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  Newspaper,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  ExternalLink,
  Upload,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

const EPaperManager = () => {
  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingEpaper, setEditingEpaper] = useState(null);
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');

  useEffect(() => {
    fetchEPapers();
  }, []);

  const fetchEPapers = async () => {
    try {
      const { data } = await API.get('/epapers');
      setEpapers(Array.isArray(data?.epapers) ? data.epapers : []);
    } catch (error) {
      console.error('Error fetching e-papers:', error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setPublishDate('');
    setPdfFile(null);
    setPdfFileName('');
    setEditingEpaper(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please select a PDF file only' });
        return;
      }
      setPdfFile(file);
      setPdfFileName(file.name);
    }
  };

  const handleEdit = (epaper) => {
    setEditingEpaper(epaper);
    setTitle(epaper.title);
    setPublishDate(epaper.publishDate.split('T')[0]);
    setPdfFileName(epaper.pdfUrl ? 'Current PDF' : 'Current PDF');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('publishDate', publishDate);

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      } else if (!editingEpaper) {
        setMessage({ type: 'error', text: 'Please select a PDF file' });
        setSubmitting(false);
        return;
      }

      if (editingEpaper) {
        await API.put(`/admin/epapers/${editingEpaper._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'E-Paper updated successfully!' });
      } else {
        await API.post('/admin/epapers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage({ type: 'success', text: 'E-Paper added successfully!' });
      }

      resetForm();
      fetchEPapers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save e-paper' });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this e-paper?')) return;

    try {
      await API.delete(`/admin/epapers/${id}`);
      setEpapers(epapers.filter((e) => e._id !== id));
      setMessage({ type: 'success', text: 'E-Paper deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete e-paper' });
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPdfUrl = (epaper) => {
    return resolveMediaUrl(epaper.pdfUrl || epaper.pdfPath);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900 flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-primary-600" />
            E-Paper Manager
          </h1>
          <p className="text-charcoal-500 mt-1">
            {epapers.length} edition{epapers.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={() => {
            if (!showForm || editingEpaper) {
              resetForm();
              setShowForm(true);
            } else {
              setShowForm(false);
            }
          }}
          className={`flex items-center gap-2 ${showForm && !editingEpaper ? 'btn-secondary' : 'btn-primary'}`}
        >
          {showForm && !editingEpaper ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showForm && !editingEpaper ? 'Hide Form' : 'New E-Paper'}
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
        <div className="card p-6 md:p-8">
          <h2 className="font-display text-xl font-bold text-charcoal-900 mb-6">
            {editingEpaper ? 'Edit E-Paper Edition' : 'Add New E-Paper Edition'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Edition Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., News Portal - Morning Edition"
                required
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Publish Date
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  PDF File
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className="input-field flex items-center gap-2 cursor-pointer hover:bg-charcoal-50"
                  >
                    <Upload className="w-4 h-4 text-charcoal-400" />
                    <span className="text-charcoal-500 truncate">
                      {pdfFileName || 'Choose PDF file...'}
                    </span>
                  </label>
                </div>
                <p className="mt-1 text-xs text-charcoal-400">
                  Only PDF files allowed (Max 10MB)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : editingEpaper ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {submitting ? 'Saving...' : editingEpaper ? 'Update E-Paper' : 'Add E-Paper'}
              </button>
              {editingEpaper && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* E-Papers List */}
      {loading ? (
        <Loader text="Loading e-papers..." />
      ) : (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-200 bg-charcoal-50">
            <h3 className="font-display font-bold text-charcoal-900">Published Editions</h3>
          </div>
          <div className="divide-y divide-charcoal-100">
            {epapers.map((epaper) => (
              <div key={epaper._id} className="px-6 py-4 flex items-center justify-between hover:bg-charcoal-50 transition-colors">
                <div>
                  <p className="font-semibold text-charcoal-900 text-sm">{epaper.title}</p>
                  <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(epaper.publishDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getPdfUrl(epaper)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleEdit(epaper)}
                    className="p-2 text-charcoal-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit e-paper"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(epaper._id)}
                    className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete e-paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {epapers.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                <p className="text-charcoal-500">No e-papers yet. Add your first edition above!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EPaperManager;
