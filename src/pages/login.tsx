import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear form data on mount to prevent browser autofill
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, _id, username, email, role, reputation } = response.data;
      const user = { _id, username, email, role, reputation };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/questions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* LEFT SIDE - Branding & Visual */}
      <div className="login-left-side">
        {/* Animated background circles */}
        <div className="login-bg-circle-1"></div>
        <div className="login-bg-circle-2"></div>
        
        {/* Content */}
        <div className="login-content-wrapper">
          <h2 className="login-welcome-title">
            Welcome to CodeQ
          </h2>
          <p className="login-welcome-text">
            Join thousands of developers asking questions and sharing knowledge.
          </p>
          <div className="login-feature-list">
            <div className="login-feature-item">
              <div className="login-feature-icon">
                💡
              </div>
              <p className="login-feature-text">Ask questions & get expert answers</p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                🚀
              </div>
              <p className="login-feature-text">Build your developer reputation</p>
            </div>
            <div className="login-feature-item">
              <div className="login-feature-icon">
                🎯
              </div>
              <p className="login-feature-text">Connect with the community</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="login-right-side">
        <div className="login-form-wrapper">
          {/* Floating Header */}
          <div className="login-header">
            <h1 className="login-title">
              Sign In
            </h1>
            <p className="login-subtitle">
              Continue your learning journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="login-error-message">
              <p className="login-error-text">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-field-container login-field-container-email">
              <label className="login-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="login-input"
                autoComplete="off"
                required
              />
            </div>

            {/* Password */}
            <div className="login-field-container login-field-container-password">
              <label className="login-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="login-input"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="login-button-container">
              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <span className="login-loading-spinner">
                    <svg className="login-spinner-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <div className="login-register-link-container">
            <p className="login-register-text">New to CodeQ?</p>
            <Link 
              href="/register" 
              className="login-register-link"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
