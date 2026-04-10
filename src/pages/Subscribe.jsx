import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  Crown,
  Check,
  Sparkles,
  Newspaper,
  Star,
  Zap,
  Shield,
  XCircle,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const Subscribe = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSub, setActiveSub] = useState(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setCheckingSubscription(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data } = await API.get('/subscription/my-subscription');
      if (data.active) {
        setActiveSub(data.subscription);
      }
    } catch (err) {
      // No active subscription
    }
    setCheckingSubscription(false);
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await API.post('/subscription/subscribe', { plan: planId });
      setSuccess(data.message);
      setActiveSub(data.subscription);
      // Refresh user info
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate subscription');
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;

    try {
      await API.delete('/subscription/cancel');
      setSuccess('Subscription cancelled');
      setActiveSub(null);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const features = [
    { icon: Newspaper, text: 'Access to all premium articles' },
    { icon: Zap, text: 'Early access to breaking news' },
    { icon: Star, text: 'Ad-free reading experience' },
    { icon: Shield, text: 'Exclusive investigative reports' },
  ];

  const plans = [
    {
      id: 'ads-free',
      name: 'Ads-Free',
      price: '₹99',
      period: '/month',
      popular: false,
      features: ['No advertisements', 'E-Paper access', 'Email newsletter'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹199',
      period: '/month',
      popular: true,
      features: [
        'Unlimited article access',
        'No advertisements',
        'E-Paper access',
        'Exclusive investigative reports',
        'Priority support',
      ],
    },
  ];

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (activeSub) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center px-4">
        <div className="text-center animate-slide-up max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-amber-900" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-3">
            You're a {activeSub.plan === 'premium' ? 'Premium' : 'Ads-Free'} Member!
          </h1>
          <p className="text-charcoal-500 text-lg mb-4">
            Your subscription is active until{' '}
            <span className="font-semibold">{new Date(activeSub.endDate).toLocaleDateString()}</span>
          </p>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-charcoal-200 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-charcoal-600 text-sm">Plan</span>
              <span className="font-semibold text-charcoal-900 capitalize">{activeSub.plan}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-charcoal-600 text-sm">Status</span>
              <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-charcoal-600 text-sm">Expires</span>
              <span className="text-charcoal-900 text-sm">{new Date(activeSub.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-primary">
              Browse Articles
            </Link>
            <button onClick={handleCancel} className="btn-outline flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full mb-6 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Premium Membership
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-balance">
            Unlock the Full
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              {' '}News Experience
            </span>
          </h1>
          <p className="text-charcoal-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Get unlimited access to premium articles, in-depth analysis, and
            exclusive content that matters.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <f.icon className="w-6 h-6 text-amber-400" />
                <span className="text-sm text-charcoal-200 text-center">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm">{success}</span>
          </div>
        )}
      </div>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`card p-8 relative animate-slide-up ${plan.popular
                  ? 'border-2 border-primary-500 shadow-xl shadow-primary-500/10 scale-105'
                  : ''
                }`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-md">
                  Most Popular
                </div>
              )}

              <h3 className="font-display text-xl font-bold text-charcoal-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="font-display text-4xl font-extrabold text-charcoal-900">{plan.price}</span>
                <span className="text-charcoal-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-charcoal-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 ${plan.popular ? 'btn-primary' : 'btn-outline'
                  }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    {user ? 'Subscribe Now' : 'Sign Up & Subscribe'}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {!user && (
          <p className="text-center mt-8 text-charcoal-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              Sign in
            </Link>
            {' '}to subscribe.
          </p>
        )}
      </section>
    </div>
  );
};

export default Subscribe;
