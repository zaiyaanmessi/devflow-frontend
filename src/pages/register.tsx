import { useState, useEffect } from 'react';
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
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Clear form data on mount to prevent browser autofill
  useEffect(() => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) return '';
    if (confirmPassword !== password) {
      return 'Passwords do not match';
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
      const passwordError = validatePassword(value);
      setValidationErrors({
        ...validationErrors,
        password: passwordError,
        confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
      });
    } else if (name === 'confirmPassword') {
      setValidationErrors({
        ...validationErrors,
        confirmPassword: validateConfirmPassword(value, formData.password),
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
      confirmPassword: true,
    });

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    setValidationErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    // Don't submit if there are validation errors
    if (emailError || passwordError || confirmPasswordError) {
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
                autoComplete="off"
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
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={`register-input ${touched.email && validationErrors.email ? 'login-input-error' : ''} ${touched.email && !validationErrors.email && formData.email ? 'login-input-valid' : ''}`}
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
            <div className="register-field-container">
              <label className="register-label">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a password"
                className={`register-input ${touched.password && validationErrors.password ? 'login-input-error' : ''} ${touched.password && !validationErrors.password && formData.password ? 'login-input-valid' : ''}`}
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
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={`register-input ${touched.confirmPassword && validationErrors.confirmPassword ? 'login-input-error' : ''} ${touched.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword ? 'login-input-valid' : ''}`}
                autoComplete="new-password"
                required
              />
              {touched.confirmPassword && validationErrors.confirmPassword && (
                <p className="login-validation-error">{validationErrors.confirmPassword}</p>
              )}
              {touched.confirmPassword && !validationErrors.confirmPassword && formData.confirmPassword && (
                <p className="login-validation-success">✓ Passwords match</p>
              )}
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
