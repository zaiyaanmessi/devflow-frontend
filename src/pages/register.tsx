import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      const { token, _id, username, email, role, reputation } = response.data;
      const user = { _id, username, email, role, reputation };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/questions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* LEFT SIDE - Branding & Visual (EXACT SAME as login) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 relative overflow-hidden items-center justify-center p-12">
        {/* Animated background circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        {/* Content */}
        <div className="relative z-10 text-white">
          <h2 className="text-6xl font-extrabold mb-6 leading-tight">
            Welcome to<br />CodeQ
          </h2>
          <p className="text-2xl text-cyan-100 mb-8 leading-relaxed">
            Join thousands of developers asking questions and sharing knowledge.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm">
                💡
              </div>
              <p className="text-lg text-cyan-50">Ask questions & get expert answers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm">
                🚀
              </div>
              <p className="text-lg text-cyan-50">Build your developer reputation</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl backdrop-blur-sm">
                🎯
              </div>
              <p className="text-lg text-cyan-50">Connect with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Floating Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-white mb-4">
              Create Account
            </h1>
            <p className="text-slate-400 text-lg">
              Join CodeQ today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded-r-lg mb-6">
              <p className="font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* Form - No background box */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all backdrop-blur-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all backdrop-blur-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all backdrop-blur-sm"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full px-6 py-4 bg-slate-800/50 border-2 border-slate-700 rounded-xl text-white text-lg placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all backdrop-blur-sm"
                required
              />
            </div>

            {/* Submit Button - STUNNING */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-bold rounded-xl hover:from-blue-400 hover:to-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.02] disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link - Floating */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-base mb-2">Already have an account?</p>
            <Link 
              href="/login" 
              className="text-cyan-400 text-lg font-bold hover:text-cyan-300 transition-colors inline-block hover:scale-105 transition-transform"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}