import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Newspaper,
  Menu,
  X,
  LogIn,
  LogOut,
  UserPlus,
  Crown,
  LayoutDashboard,
  FileText,
  Home,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isStaff = user?.role === 'admin' || user?.role === 'employee';

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/charchapatra', label: 'Charchapatra', icon: MessageSquare },
    { to: '/epapers', label: 'E-Paper', icon: FileText },
    { to: '/subscribe', label: 'Subscribe', icon: Crown },
  ];

  const getSubscriptionBadge = () => {
    if (!user?.isSubscribed) return null;
    const plan = user.subscriptionPlan || 'premium';
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-[10px] font-bold rounded-full shadow-sm">
        <Sparkles className="w-3 h-3" />
        {plan === 'premium' ? 'PREMIUM' : 'ADS-FREE'}
      </span>
    );
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-charcoal-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-charcoal-900 tracking-tight">
              News<span className="text-primary-600">Portal</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isStaff && (
                  <Link
                    to="/admin"
                    className="btn-ghost flex items-center gap-2 text-sm text-primary-600"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {user.role === 'admin' ? 'Admin Panel' : 'Employee Panel'}
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-50 rounded-full">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-charcoal-700">
                      {user.name}
                    </span>
                    {getSubscriptionBadge()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center gap-2 text-sm text-charcoal-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost flex items-center gap-2 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden btn-ghost p-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-200 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}

            <hr className="border-charcoal-200 my-2" />

            {user ? (
              <>
                {isStaff && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {user.role === 'admin' ? 'Admin Panel' : 'Employee Panel'}
                  </Link>
                )}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{user.name}</span>
                    {getSubscriptionBadge()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-charcoal-700 hover:bg-charcoal-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
