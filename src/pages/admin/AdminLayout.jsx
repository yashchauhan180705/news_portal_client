import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  ArrowLeft,
  Shield,
  MessageSquare,
  Users,
  UserCog,
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/articles', label: 'Articles', icon: FileText },
    { to: '/admin/epapers', label: 'E-Papers', icon: Newspaper },
    { to: '/admin/charchapatra', label: 'Charchapatra', icon: MessageSquare },
    ...(isAdmin ? [
      { to: '/admin/employees', label: 'Employees', icon: UserCog },
      { to: '/admin/users', label: 'Users', icon: Users },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-charcoal-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-charcoal-900 text-white flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-charcoal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">
                {isAdmin ? 'Admin Panel' : 'Employee Panel'}
              </h2>
              <p className="text-charcoal-400 text-xs">Content Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30'
                    : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-charcoal-700">
          <NavLink
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-charcoal-400 hover:bg-charcoal-800 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Site
          </NavLink>
        </div>
      </aside>

      {/* Mobile top bar for admin */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-charcoal-900 border-b border-charcoal-700">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-charcoal-400 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-charcoal-400 hover:text-white whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            Site
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:p-8 p-4 pt-16 lg:pt-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
