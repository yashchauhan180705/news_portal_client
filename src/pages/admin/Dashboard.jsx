import { useState, useEffect } from 'react';
import API from '../../services/api';
import { Loader } from '../../components/Loader';
import {
  FileText,
  Users,
  Crown,
  TrendingUp,
  Activity,
  UserCog,
  Ban,
  CreditCard,
  FileCheck,
  FilePen,
  MessageSquare,
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setError('');
      try {
        const { data } = await API.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Could not load dashboard stats. Please login again or verify backend connection.');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="card p-6 text-center">
        <h2 className="font-display text-xl font-bold text-charcoal-900 mb-2">
          Unable to load dashboard
        </h2>
        <p className="text-charcoal-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Articles',
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Published',
      value: stats?.publishedArticles || 0,
      icon: FileCheck,
      bgLight: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Drafts',
      value: stats?.draftArticles || 0,
      icon: FilePen,
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Employees',
      value: stats?.employeeCount || 0,
      icon: UserCog,
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Premium Articles',
      value: stats?.premiumArticles || 0,
      icon: Crown,
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Banned Users',
      value: stats?.bannedUsers || 0,
      icon: Ban,
      bgLight: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      label: 'Pending Charchapatra',
      value: stats?.pendingCharchapatra || 0,
      icon: MessageSquare,
      bgLight: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-primary-600" />
          <h1 className="font-display text-2xl md:text-3xl font-bold text-charcoal-900">
            Dashboard
          </h1>
        </div>
        <p className="text-charcoal-500">
          Overview of your news portal's performance and content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="card p-6 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgLight} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-3xl font-display font-extrabold text-charcoal-900 mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-charcoal-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="font-display text-lg font-bold text-charcoal-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="/admin/articles"
            className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Manage Articles</p>
              <p className="text-xs text-charcoal-500">Create, edit, or delete articles</p>
            </div>
          </a>
          <a
            href="/admin/employees"
            className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Manage Employees</p>
              <p className="text-xs text-charcoal-500">Add or remove employee accounts</p>
            </div>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Manage Users</p>
              <p className="text-xs text-charcoal-500">Ban, unban, or change user roles</p>
            </div>
          </a>
          <a
            href="/admin/charchapatra"
            className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900 text-sm">Charchapatra</p>
              <p className="text-xs text-charcoal-500">Review and approve user submissions</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
