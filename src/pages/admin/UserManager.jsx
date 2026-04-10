import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle,
  Trash2,
  AlertCircle,
  Crown,
  UserCheck,
  UserX,
} from 'lucide-react';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const { data } = await API.get(`/admin/users?${params}`);
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (err) {
      setError('Failed to load users');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBan = async (userId) => {
    if (!window.confirm('Ban this user?')) return;
    try {
      await API.put(`/admin/users/${userId}/ban`);
      setSuccess('User banned');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/unban`);
      setSuccess('User unbanned');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      setSuccess('User deleted');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      employee: 'bg-blue-100 text-blue-700 border-blue-200',
      user: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[role] || styles.user}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading) return <Loader text="Loading users..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-primary-600" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900">
            User Management
          </h1>
        </div>
        <p className="text-charcoal-500">Manage all portal users, roles, and access</p>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">{success}</span>
          <button onClick={() => setSuccess('')} className="ml-auto text-green-500 hover:text-green-700">
            <span className="text-lg">×</span>
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">
            <span className="text-lg">×</span>
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input-field pl-10 w-full"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Subscription</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-charcoal-700">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-charcoal-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-charcoal-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-charcoal-100 hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900 text-sm">{u.name}</p>
                          <p className="text-xs text-charcoal-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs border border-charcoal-200 rounded-lg px-2 py-1 bg-white"
                        disabled={u.role === 'admin'}
                      >
                        <option value="user">User</option>
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBanned ? (
                        <span className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.isSubscribed ? (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
                          <Crown className="w-3 h-3" /> {u.subscriptionPlan || 'Premium'}
                        </span>
                      ) : (
                        <span className="text-charcoal-400 text-xs">Free</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-charcoal-500 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {u.role !== 'admin' && (
                          <>
                            {u.isBanned ? (
                              <button
                                onClick={() => handleUnban(u._id)}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Unban"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBan(u._id)}
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Ban"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-charcoal-200">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-ghost text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-charcoal-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-ghost text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
