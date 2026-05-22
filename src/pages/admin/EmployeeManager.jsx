import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get('/admin/employees');
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingEmployee) {
        const updateData = { name: formData.name, email: formData.email };
        if (formData.password) updateData.password = formData.password;
        await API.put(`/admin/employees/${editingEmployee._id}`, updateData);
        setSuccess('Employee updated successfully');
      } else {
        await API.post('/admin/employees', formData);
        setSuccess('Employee created successfully');
      }
      fetchEmployees();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await API.delete(`/admin/employees/${id}`);
      setSuccess('Employee deleted');
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setFormData({ name: employee.name, email: employee.email, password: '' });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({ name: '', email: '', password: '' });
    setError('');
  };

  if (loading) return <Loader text="Loading employees..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-primary-600" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900">
              Employee Management
            </h1>
          </div>
          <p className="text-charcoal-500">Create and manage employee accounts</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setSuccess(''); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <span className="text-lg">x</span>
          </button>
        </div>
      )}

      {/* Employees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Created By</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-charcoal-500">
                    No employees found. Click "Add Employee" to create one.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-charcoal-100 hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {emp.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-charcoal-900">{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600 text-sm">{emp.email}</td>
                    <td className="px-6 py-4 text-charcoal-600 text-sm">
                      {emp.createdBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 text-sm">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-2 text-charcoal-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp._id)}
                          className="p-2 text-charcoal-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-200">
              <h2 className="font-display text-lg font-bold text-charcoal-900">
                {editingEmployee ? 'Edit Employee' : 'Create Employee'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field pl-10"
                    required
                    placeholder="Employee name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-10"
                    required
                    placeholder="employee@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal-700 mb-1">
                  {editingEmployee ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-10"
                    required={!editingEmployee}
                    placeholder={editingEmployee ? 'Leave blank to keep current' : 'Password'}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
