import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import StudentProfile from '@/components/Profile/StudentProfile';
import ExpertProfile from '@/components/Profile/ExpertProfile';
import AdminProfile from '@/components/Profile/AdminProfile';


export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'saves' | 'settings'>('profile');
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'answers' | 'questions' | 'tags'>('summary');
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '', location: '', title: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role change state
  const [selectedRole, setSelectedRole] = useState<string>('user');
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [roleChangeSuccess, setRoleChangeSuccess] = useState('');

  // Get current user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUserId(user._id);
          setCurrentUserRole(user.role);
        } catch (err) {
          console.error('Failed to parse user data:', err);
        }
      }
    }
  }, []);

  // Fetch profile data when ID is available
  useEffect(() => {
    if (!id) return;
    fetchProfile();
  }, [id]);

  // Check if it's own profile
  useEffect(() => {
    if (user && currentUserId) {
      setIsOwnProfile(user._id === currentUserId);
    }
  }, [user, currentUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${id}`);
      setUser(response.data);
      setUserRole(response.data.role);
      setSelectedRole(response.data.role);
      setEditData({
        username: response.data.username,
        bio: response.data.bio || '',
        location: response.data.location || '',
        title: response.data.title || ''
      });
      
      if (response.data.profilePicture) {
        setProfileImagePreview(response.data.profilePicture);
      }

      const questionsRes = await api.get(`/users/${id}/questions`);
      setQuestions(questionsRes.data.questions || []);

      const answersRes = await api.get(`/users/${id}/answers`);
      setAnswers(answersRes.data.answers || []);

      setError('');
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are supported.');
        return;
      }

      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image size must be less than 2 MiB.');
        return;
      }

      setProfileImage(file);
      setError('');

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.username.trim()) {
      setError('Username is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let profilePicture = null;
      
      if (profileImage) {
        const reader = new FileReader();
        profilePicture = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = reject;
          reader.readAsDataURL(profileImage);
        });
      }

      const response = await api.put(`/users/${id}`, {
        username: editData.username,
        bio: editData.bio,
        location: editData.location,
        title: editData.title,
        ...(profilePicture && { profilePicture })
      });

      setUser(response.data);
      setIsEditing(false);
      setProfileImage(null);
      
      if (response.data.profilePicture) {
        setProfileImagePreview(response.data.profilePicture);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (newRole === userRole) {
      setError('User already has this role');
      return;
    }

    if (!confirm(`Are you sure you want to change the role to ${newRole}?`)) {
      return;
    }

    setIsChangingRole(true);
    setError('');
    setRoleChangeSuccess('');

    try {
      const response = await api.put(`/users/${id}/role`, { role: newRole });
      setUser(response.data.user);
      setUserRole(response.data.user.role);
      setSelectedRole(response.data.user.role);
      setRoleChangeSuccess(`Role successfully changed to ${newRole}!`);
      
      if (isOwnProfile && typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            parsedUser.role = newRole;
            localStorage.setItem('user', JSON.stringify(parsedUser));
            setCurrentUserRole(newRole);
          } catch (err) {
            console.error('Failed to update localStorage:', err);
          }
        }
      }

      setTimeout(() => setRoleChangeSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error changing role:', err);
      setError(err.response?.data?.error || 'Failed to change role');
    } finally {
      setIsChangingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-detail-loading">
        <div className="profile-detail-loading-content">
          <div className="profile-detail-loading-text">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-detail-loading">
        <div className="profile-detail-loading-content">
          <div className="profile-detail-loading-text">User not found</div>
          <Link href="/questions" className="profile-detail-back-link">
            ← Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  const commonProps = {
    user,
    userRole,
    currentUserId,
    isOwnProfile,
    questions,
    answers,
    isEditing,
    setIsEditing,
    editData,
    setEditData,
    isSaving,
    error,
    setError,
    onUpdateProfile: handleUpdateProfile,
    selectedRole,
    isChangingRole,
    onChangeRole: handleChangeRole,
    canChangeRole: isOwnProfile
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const memberSince = user.createdAt ? formatDate(user.createdAt) : 'N/A';

  // If editing, show edit profile page
  if (isEditing) {
    return (
      <div className="profile-detail-edit-container">
        <div className="profile-detail-edit-main">
          {error && (
            <div className="profile-detail-error">
              {error}
            </div>
          )}

          <div className="profile-detail-edit-form-container">
            <h1 className="profile-detail-edit-title">Public information</h1>
            
            <div className="profile-detail-edit-grid">
              {/* Left Column - Settings Navigation */}
              <div className="profile-detail-edit-sidebar">
                <div className="profile-detail-edit-settings-section">
                  <div>
                    <h3 className="profile-detail-edit-settings-group-title">Email Settings</h3>
                    <ul className="profile-detail-edit-settings-list">
                      <li><a href="#" className="profile-detail-edit-settings-link cyan">Edit email settings</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Tag watching & ignoring</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Community digests</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Question subscriptions</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="profile-detail-edit-settings-group-title">Site Settings</h3>
                    <ul className="profile-detail-edit-settings-list">
                      <li><a href="#" className="profile-detail-edit-settings-link">Preferences</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Flair</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Hide communities</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="profile-detail-edit-settings-group-title">Access</h3>
                    <ul className="profile-detail-edit-settings-list">
                      <li><a href="#" className="profile-detail-edit-settings-link">Collectives</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Logins</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">Data dump access</a></li>
                      <li><a href="#" className="profile-detail-edit-settings-link">RSS feeds</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="profile-detail-edit-settings-group-title">API</h3>
                    <ul className="profile-detail-edit-settings-list">
                      <li><a href="#" className="profile-detail-edit-settings-link">Authorized applications</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Edit Form */}
              <div className="profile-detail-edit-content">
                <form onSubmit={handleUpdateProfile} className="profile-detail-edit-form">
                  {/* Profile Image */}
                  <div className="profile-detail-edit-image-section">
                    <div className="profile-detail-edit-image-preview">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile" 
                          className="profile-detail-edit-image-preview-img"
                        />
                      ) : (
                        <span className="profile-detail-edit-image-preview-text">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="profile-detail-edit-image-input"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="profile-detail-edit-image-button"
                    >
                      Change picture
                    </button>
                  </div>

                  {/* Display Name */}
                  <div className="profile-detail-edit-field-group">
                    <label className="profile-detail-edit-label">Display name</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="profile-detail-edit-input"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="profile-detail-edit-field-group">
                    <label className="profile-detail-edit-label">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="Add location"
                      className="profile-detail-edit-input"
                    />
                  </div>

                  {/* Title */}
                  <div className="profile-detail-edit-field-group">
                    <label className="profile-detail-edit-label">Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="No title has been set"
                      className="profile-detail-edit-input"
                    />
                  </div>

                  {/* About Me */}
                  <div className="profile-detail-edit-field-group">
                    <label className="profile-detail-edit-label">About me</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={8}
                      className="profile-detail-edit-textarea"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="profile-detail-edit-buttons">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="profile-detail-edit-save"
                    >
                      {isSaving ? 'Saving...' : 'Save profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileImage(null);
                        setProfileImagePreview(user.profilePicture || null);
                      }}
                      className="profile-detail-edit-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-detail-container">
      <div className="profile-detail-main">
        {error && (
          <div className="profile-detail-error">
            {error}
          </div>
        )}

        {roleChangeSuccess && (
          <div className="profile-detail-success">
            {roleChangeSuccess}
          </div>
        )}

        {/* Profile Header */}
        <div className="profile-detail-header">
          <div className="profile-detail-header-content">
            {/* Avatar */}
            <div className="profile-detail-avatar">
              {user.profilePicture || profileImagePreview ? (
                <img 
                  src={user.profilePicture || profileImagePreview || ''} 
                  alt={user.username} 
                  className="profile-detail-avatar-img"
                />
              ) : (
                <span className="profile-detail-avatar-text">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="profile-detail-user-info">
              <div className="profile-detail-user-header">
                <h1 className="profile-detail-username">{user.username}</h1>
                <span className={`profile-detail-role-badge ${userRole || 'user'}`}>
                  {userRole === 'admin' ? '👨‍💼 Admin' :
                   userRole === 'expert' ? '👨‍🏫 Expert' :
                   '👨‍🎓 Student'}
                </span>
              </div>
              <div className="profile-detail-user-meta">
                <p>Member since {memberSince}</p>
                <p>Last seen {memberSince}</p>
                <p>Visited 1 day, 1 consecutive</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="profile-detail-actions">
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="profile-detail-edit-button"
                >
                  Edit profile
                </button>
              )}
              {isOwnProfile && (
                <div className="profile-detail-role-select-wrapper">
                  <label className="profile-detail-role-select-label">Change My Role:</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => handleChangeRole(e.target.value)}
                    disabled={isChangingRole}
                    className="profile-detail-role-select"
                  >
                    <option value="user">👨‍🎓 Student</option>
                    <option value="expert">👨‍🏫 Expert</option>
                    <option value="admin">👨‍💼 Admin</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="profile-detail-tabs">
            <button
              onClick={() => setActiveTab('profile')}
              className={`profile-detail-tab ${activeTab === 'profile' ? 'active' : ''}`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`profile-detail-tab ${activeTab === 'activity' ? 'active' : ''}`}
            >
              Activity
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab('saves')}
                  className={`profile-detail-tab ${activeTab === 'saves' ? 'active' : ''}`}
                >
                  Saves
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`profile-detail-tab ${activeTab === 'settings' ? 'active' : ''}`}
                >
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area - Two Column Layout */}
        {activeTab === 'profile' && (
          <div className="profile-detail-content-grid">
            {/* Left Sidebar - Sub Navigation */}
            <div className="profile-detail-content-sidebar">
              <div className="profile-detail-sub-nav">
                <h2 className="profile-detail-sub-nav-title">Summary</h2>
                <nav className="profile-detail-sub-nav-list">
                  {['summary', 'answers', 'questions', 'tags'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab as any)}
                      className={`profile-detail-sub-nav-button ${activeSubTab === tab ? 'active' : ''}`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right Content */}
            <div className="profile-detail-content-main">
              {activeSubTab === 'summary' && (
                <div className="profile-detail-section">
                  {/* Info Cards */}
                  <div className="profile-detail-info-cards">
                    <div className="profile-detail-info-card">
                      <div className="profile-detail-info-card-header">
                        <div className="profile-detail-info-card-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="profile-detail-info-card-title">Reputation</h3>
                      </div>
                      <p className="profile-detail-info-card-description">
                        Reputation is how the community thanks you. Upvotes earn reputation and unlock privileges.
                      </p>
                      <a href="#" className="profile-detail-info-card-link">Learn more about reputation</a>
                    </div>

                    <div className="profile-detail-info-card">
                      <div className="profile-detail-info-card-header">
                        <div className="profile-detail-info-card-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h3 className="profile-detail-info-card-title">Badges</h3>
                      </div>
                      <p className="profile-detail-info-card-description">
                        Earn badges for helpful actions. Badges are digital flair for helpful participation.
                      </p>
                      <button className="profile-detail-info-card-button">
                        Take the Tour
                      </button>
                    </div>

                    <div className="profile-detail-info-card">
                      <div className="profile-detail-info-card-header">
                        <div className="profile-detail-info-card-icon">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="profile-detail-info-card-title">Impact</h3>
                      </div>
                      <p className="profile-detail-info-card-description">
                        Your posts and actions help thousands of people find answers.
                      </p>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div className="profile-detail-section">
                    <div className="profile-detail-section-header">
                      <h2 className="profile-detail-section-title">Answers</h2>
                      <div className="profile-detail-section-filters">
                        {['Score', 'Activity', 'Newest', 'Views'].map((filter) => (
                          <button
                            key={filter}
                            className="profile-detail-filter-button"
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    {answers.length === 0 ? (
                      <p className="profile-detail-empty-state">No answers yet</p>
                    ) : (
                      <div className="profile-detail-items-list">
                        {answers.slice(0, 5).map((answer: any) => (
                          <div key={answer._id} className="profile-detail-item-card">
                            <Link
                              href={`/questions/${answer.questionId._id}`}
                              className="profile-detail-item-card-link"
                            >
                              {answer.questionId?.title || 'Question'}
                            </Link>
                            <p className="profile-detail-item-body">{answer.body}</p>
                            <div className="profile-detail-item-meta">
                              <span>{answer.votes || 0} votes</span>
                              {answer.isAccepted && (
                                <span className="profile-detail-item-accepted">✓ Accepted</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Questions Section */}
                  <div className="profile-detail-section">
                    <div className="profile-detail-section-header">
                      <h2 className="profile-detail-section-title">Questions</h2>
                      <div className="profile-detail-section-filters">
                        {['Score', 'Activity', 'Newest', 'Views'].map((filter) => (
                          <button
                            key={filter}
                            className="profile-detail-filter-button"
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    {questions.length === 0 ? (
                      <p className="profile-detail-empty-state">No questions yet</p>
                    ) : (
                      <div className="profile-detail-items-list">
                        {questions.slice(0, 5).map((question: any) => (
                          <Link
                            key={question._id}
                            href={`/questions/${question._id}`}
                            className="profile-detail-item-card-hover"
                          >
                            <h3 className="profile-detail-item-title">
                              {question.title}
                            </h3>
                            <div className="profile-detail-item-meta">
                              <span>{question.votes || 0} votes</span>
                              <span>{question.answers || 0} answers</span>
                              <span>{question.views || 0} views</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === 'answers' && (
                <div className="profile-detail-section">
                  <h2 className="profile-detail-section-title">All Answers</h2>
                  {answers.length === 0 ? (
                    <p className="profile-detail-empty-state">No answers yet</p>
                  ) : (
                    <div className="profile-detail-items-list">
                      {answers.map((answer: any) => (
                        <div key={answer._id} className="profile-detail-item-card">
                          <Link
                            href={`/questions/${answer.questionId._id}`}
                            className="profile-detail-item-card-link"
                          >
                            {answer.questionId?.title || 'Question'}
                          </Link>
                          <p className="profile-detail-item-body profile-detail-item-body-clamp-3">{answer.body}</p>
                          <div className="profile-detail-item-meta">
                            <span>{answer.votes || 0} votes</span>
                            {answer.isAccepted && (
                              <span className="profile-detail-item-accepted">✓ Accepted</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'questions' && (
                <div className="profile-detail-section">
                  <h2 className="profile-detail-section-title">All Questions</h2>
                  {questions.length === 0 ? (
                    <p className="profile-detail-empty-state">No questions yet</p>
                  ) : (
                    <div className="profile-detail-items-list">
                      {questions.map((question: any) => (
                        <Link
                          key={question._id}
                          href={`/questions/${question._id}`}
                          className="profile-detail-item-card-hover"
                        >
                          <h3 className="profile-detail-item-title">
                            {question.title}
                          </h3>
                          <div className="profile-detail-item-meta">
                            <span>{question.votes || 0} votes</span>
                            <span>{question.answers || 0} answers</span>
                            <span>{question.views || 0} views</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'tags' && (
                <div className="profile-detail-section">
                  <h2 className="profile-detail-section-title">Tags</h2>
                  <p className="profile-detail-empty-state">Tag activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="profile-detail-section">
            <h2 className="profile-detail-section-title">Activity</h2>
            <p className="profile-detail-empty-state">Activity feed will appear here</p>
          </div>
        )}

        {activeTab === 'saves' && (
          <div className="profile-detail-section">
            <h2 className="profile-detail-section-title">Saves</h2>
            <p className="profile-detail-empty-state">Saved items will appear here</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="profile-detail-section">
            <h2 className="profile-detail-section-title">Settings</h2>
            <p className="profile-detail-empty-state">Settings will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
