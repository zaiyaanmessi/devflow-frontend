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
    <div className="register-page-container">
      {/* LEFT SIDE - Branding & Visual (Reuses login styles) */}
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

      {/* RIGHT SIDE - Register Form */}
      <div className="register-right-side">
        <div className="register-form-wrapper">
          {/* Floating Header */}
          <div className="register-header">
            <h1 className="register-title">
              Create Account
            </h1>
            <p className="register-subtitle">
              Join CodeQ today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="register-error-message">
              <p className="register-error-text">⚠️ {error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Username */}
            <div className="register-field-container">
              <label className="register-label">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="register-input"
                required
              />
            </div>

            {/* Email */}
            <div className="register-field-container">
              <label className="register-label">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="register-input"
                required
              />
            </div>

            {/* Password */}
            <div className="register-field-container">
              <label className="register-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="register-input"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="register-field-container">
              <label className="register-label">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="register-input"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="register-button-container">
              <button
                type="submit"
                disabled={loading}
                className="register-button"
              >
                {loading ? (
                  <span className="register-loading-spinner">
                    <svg className="register-spinner-icon" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="register-login-link-container">
            <p className="register-login-text">Already have an account?</p>
            <Link 
              href="/login" 
              className="register-login-link"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
