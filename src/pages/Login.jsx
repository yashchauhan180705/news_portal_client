import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, Newspaper, KeyRound, RefreshCw, CheckCircle } from 'lucide-react';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: credentials, 2: OTP
  const [countdown, setCountdown] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await API.post('/auth/send-otp', {
        email,
        purpose: 'login',
      });
      setStep(2);
      setCountdown(60);
      setSuccess(data.message || 'OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Validate credentials and send OTP
      if (step === 1) {
        if (!email || !password) {
          setError('Please enter email and password');
          setLoading(false);
          return;
        }
        await handleSendOtp();
        return;
      }

      // Step 2: Login with email + password + OTP (all mandatory)
      const data = await login(email, password, otp);
      if (data.role === 'admin' || data.role === 'employee') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 423) {
        setError(err.response?.data?.message || 'Account locked. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    await handleSendOtp();
  };

  const handleBackToCredentials = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-charcoal-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl shadow-lg mb-4">
            <Newspaper className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-900">
            Welcome Back
          </h1>
          <p className="text-charcoal-500 mt-2">
            {step === 1 ? 'Sign in to access your account' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 1 ? 'bg-primary-600 text-white' : 'bg-charcoal-200 text-charcoal-500'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-primary-600' : 'bg-charcoal-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step >= 2 ? 'bg-primary-600 text-white' : 'bg-charcoal-200 text-charcoal-500'
          }`}>
            2
          </div>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 animate-fade-in">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <KeyRound className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-charcoal-700">OTP verification is required for secure login</span>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-700 mb-2">
                    Enter OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      required
                      maxLength={6}
                      className="input-field pl-12 text-center text-xl tracking-widest font-mono"
                    />
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    OTP sent to {email}
                  </p>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-charcoal-500">
                      Resend OTP in <span className="font-semibold text-primary-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1 mx-auto"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="text-sm text-charcoal-500 hover:text-charcoal-700 w-full text-center"
                >
                  ← Back to credentials
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {step === 1 ? 'Continue & Send OTP' : 'Verify & Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-charcoal-500 text-sm">
              <Link to="/forgot-password" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Forgot Password?
              </Link>
            </p>
            <p className="text-charcoal-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        {/*<div className="mt-6 p-4 bg-charcoal-100 rounded-xl border border-charcoal-200">*/}
        {/*  <p className="text-xs font-semibold text-charcoal-600 mb-2">Demo Credentials:</p>*/}
        {/*  <div className="space-y-1 text-xs text-charcoal-500">*/}
        {/*    <p><span className="font-medium">Admin:</span> cyash7420@gmail.com / yash123</p>*/}
        {/*    <p><span className="font-medium">Subscriber:</span> subscriber@example.com / user123</p>*/}
        {/*    <p><span className="font-medium">Free User:</span> user@example.com / user123</p>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default Login;
