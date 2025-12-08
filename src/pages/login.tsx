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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Clear form data on mount to prevent browser autofill
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
  }, []);

  // Email validation
  const validateEmail = (email: string): string => {
    if (!email) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation - relaxed requirements
  const validatePassword = (password: string): string => {
    if (!password) return '';
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return 'Password must contain at least one letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation
    if (name === 'email') {
      setValidationErrors({
        ...validationErrors,
        email: validateEmail(value),
      });
    } else if (name === 'password') {
      setValidationErrors({
        ...validationErrors,
        password: validatePassword(value),
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setValidationErrors({
      email: emailError,
      password: passwordError,
    });

    // Don't submit if there are validation errors
    if (emailError || passwordError) {
      return;
    }

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

          {/* Team Information */}
          <div className="login-team-info">
            <div className="login-team-section">
              <h3 className="login-team-title">Team Members</h3>
              <div className="login-team-members">
                <div className="login-team-member-item">
                  <span className="login-team-member-name">Zaiyaan Najam</span>
                </div>
                <div className="login-team-member-item">
                  <span className="login-team-member-name">Dheeraaj Pinjala</span>
                </div>
              </div>
            </div>
            <div className="login-repo-section">
              <h3 className="login-repo-title">Repository Links</h3>
              <div className="login-repo-links">
                <a 
                  href="https://github.com/zaiyaanmessi/devflow-frontend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="login-repo-link"
                >
                  <span className="login-repo-link-text">Frontend Repository</span>
                  <span className="login-repo-link-arrow">→</span>
                </a>
                <a 
                  href="https://github.com/zaiyaanmessi/devflow-backend" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="login-repo-link"
                >
                  <span className="login-repo-link-text">Backend Repository</span>
                  <span className="login-repo-link-arrow">→</span>
                </a>
              </div>
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
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`login-input ${touched.email && validationErrors.email ? 'login-input-error' : ''} ${touched.email && !validationErrors.email && formData.email ? 'login-input-valid' : ''}`}
                autoComplete="off"
                required
              />
              {touched.email && validationErrors.email && (
                <p className="login-validation-error">{validationErrors.email}</p>
              )}
              {touched.email && !validationErrors.email && formData.email && (
                <p className="login-validation-success">✓ Valid email format</p>
              )}
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
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`login-input ${touched.password && validationErrors.password ? 'login-input-error' : ''} ${touched.password && !validationErrors.password && formData.password ? 'login-input-valid' : ''}`}
                autoComplete="new-password"
                required
              />
              {touched.password && validationErrors.password && (
                <p className="login-validation-error">{validationErrors.password}</p>
              )}
              {touched.password && !validationErrors.password && formData.password && (
                <p className="login-validation-success">✓ Password meets all requirements</p>
              )}
              {touched.password && formData.password && (
                <div className="login-password-requirements">
                  <p className="login-requirements-title">Password must contain:</p>
                  <ul className="login-requirements-list">
                    <li className={formData.password.length >= 6 ? 'login-requirement-met' : 'login-requirement-unmet'}>
                      {formData.password.length >= 6 ? '✓' : '○'} At least 6 characters
                    </li>
                    <li className={/[a-zA-Z]/.test(formData.password) ? 'login-requirement-met' : 'login-requirement-unmet'}>
                      {/[a-zA-Z]/.test(formData.password) ? '✓' : '○'} At least one letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'login-requirement-met' : 'login-requirement-unmet'}>
                      {/[0-9]/.test(formData.password) ? '✓' : '○'} At least one number
                    </li>
                  </ul>
                </div>
              )}
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
