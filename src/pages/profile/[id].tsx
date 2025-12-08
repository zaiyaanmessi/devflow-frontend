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
  const [tags, setTags] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'settings'>('profile');
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
      const userQuestions = questionsRes.data.questions || [];
      setQuestions(userQuestions);

      const answersRes = await api.get(`/users/${id}/answers`);
      setAnswers(answersRes.data.answers || []);

      // Extract and count tags from user's questions
      const tagMap: { [key: string]: number } = {};
      userQuestions.forEach((q: any) => {
        if (q.tags && Array.isArray(q.tags)) {
          q.tags.forEach((tag: string) => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      });
      
      const tagsArray = Object.entries(tagMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count); // Sort by count descending
      
      setTags(tagsArray);

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
              {/* Profile Edit Form */}
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
                {user.title && (
                  <p className="profile-detail-user-designation">{user.title}</p>
                )}
                {user.location && (
                  <p className="profile-detail-user-location">📍 {user.location}</p>
                )}
                {user.bio && (
                  <p className="profile-detail-user-bio">{user.bio}</p>
                )}
                {!user.title && !user.location && !user.bio && (
                  <p className="profile-detail-user-meta-text">Member since {memberSince}</p>
                )}
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
              <button
                onClick={() => setActiveTab('settings')}
                className={`profile-detail-tab ${activeTab === 'settings' ? 'active' : ''}`}
              >
                Settings
              </button>
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

                  {/* Answers Section */}
                  <div className="profile-detail-section">
                    <div className="profile-detail-section-header">
                      <h2 className="profile-detail-section-title">Top Answers</h2>
                      <Link 
                        href={`/profile/${id}?tab=answers`}
                        className="profile-detail-section-view-all"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSubTab('answers');
                        }}
                      >
                        View all {answers.length} answers →
                      </Link>
                    </div>
                    {answers.length === 0 ? (
                      <div className="profile-detail-empty-state-card">
                        <p className="profile-detail-empty-state-text">No answers yet</p>
                        <p className="profile-detail-empty-state-subtext">Start helping the community by answering questions!</p>
                      </div>
                    ) : (
                      <div className="profile-detail-items-list">
                        {answers.slice(0, 5).map((answer: any) => (
                          <Link
                            key={answer._id}
                            href={`/questions/${answer.questionId?._id || answer.questionId}`}
                            className="profile-detail-item-card profile-detail-item-card-hover"
                          >
                            <div className="profile-detail-item-header">
                              <h3 className="profile-detail-item-title">
                                {answer.questionId?.title || 'Question'}
                              </h3>
                              {answer.isAccepted && (
                                <span className="profile-detail-item-badge-accepted">
                                  <svg className="profile-detail-item-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Accepted
                                </span>
                              )}
                              {answer.isVerified && (
                                <span className="profile-detail-item-badge-verified">
                                  <svg className="profile-detail-item-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Verified
                                </span>
                              )}
                            </div>
                            <div 
                              className="profile-detail-item-body"
                              dangerouslySetInnerHTML={{
                                __html: (answer.body || '').substring(0, 200) + (answer.body?.length > 200 ? '...' : '')
                                  .replace(
                                    /\[your image\]\((data:image\/[^)]+)\)/g,
                                    '<span class="text-cyan-400">[Image]</span>'
                                  )
                                  .replace(
                                    /\[([^\]]+)\]\(([^)]+)\)/g,
                                    '<span class="text-cyan-400">$1</span>'
                                  )
                              }}
                            />
                            <div className="profile-detail-item-meta">
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                <span>{answer.votes || 0} votes</span>
                              </div>
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date(answer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Questions Section */}
                  <div className="profile-detail-section">
                    <div className="profile-detail-section-header">
                      <h2 className="profile-detail-section-title">Top Questions</h2>
                      <Link 
                        href={`/profile/${id}?tab=questions`}
                        className="profile-detail-section-view-all"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSubTab('questions');
                        }}
                      >
                        View all {questions.length} questions →
                      </Link>
                    </div>
                    {questions.length === 0 ? (
                      <div className="profile-detail-empty-state-card">
                        <p className="profile-detail-empty-state-text">No questions yet</p>
                        <p className="profile-detail-empty-state-subtext">Start asking questions to get help from the community!</p>
                      </div>
                    ) : (
                      <div className="profile-detail-items-list">
                        {questions.slice(0, 5).map((question: any) => (
                          <Link
                            key={question._id}
                            href={`/questions/${question._id}`}
                            className="profile-detail-item-card profile-detail-item-card-hover"
                          >
                            <div className="profile-detail-item-header">
                              <h3 className="profile-detail-item-title">
                                {question.title}
                              </h3>
                              {question.isPinned && (
                                <span className="profile-detail-item-badge-pinned">
                                  <svg className="profile-detail-item-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                  </svg>
                                  Pinned
                                </span>
                              )}
                              {question.acceptedAnswer && (
                                <span className="profile-detail-item-badge-solved">
                                  <svg className="profile-detail-item-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Solved
                                </span>
                              )}
                            </div>
                            <div 
                              className="profile-detail-item-body"
                              dangerouslySetInnerHTML={{
                                __html: (question.body || '').substring(0, 200) + (question.body?.length > 200 ? '...' : '')
                                  .replace(
                                    /\[your image\]\((data:image\/[^)]+)\)/g,
                                    '<span class="text-cyan-400">[Image]</span>'
                                  )
                                  .replace(
                                    /\[([^\]]+)\]\(([^)]+)\)/g,
                                    '<span class="text-cyan-400">$1</span>'
                                  )
                              }}
                            />
                            {question.tags && question.tags.length > 0 && (
                              <div className="profile-detail-item-tags">
                                {question.tags.slice(0, 3).map((tag: string) => (
                                  <span key={tag} className="profile-detail-item-tag">
                                    {tag}
                                  </span>
                                ))}
                                {question.tags.length > 3 && (
                                  <span className="profile-detail-item-tag-more">+{question.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                            <div className="profile-detail-item-meta">
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                </svg>
                                <span>{question.votes || 0} votes</span>
                              </div>
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{question.answerCount || question.answers?.length || 0} answers</span>
                              </div>
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{question.views || 0} views</span>
                              </div>
                              <div className="profile-detail-item-meta-group">
                                <svg className="profile-detail-item-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date(question.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
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
                  <div className="profile-detail-section-header">
                    <h2 className="profile-detail-section-title">Tags</h2>
                  </div>
                  {tags.length === 0 ? (
                    <p className="profile-detail-empty-state">No tags yet. Tags will appear here when you ask questions with tags.</p>
                  ) : (
                    <div className="profile-detail-items-list">
                      {tags.map((tag) => (
                        <Link
                          key={tag.name}
                          href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                          className="profile-detail-item-card-hover"
                        >
                          <h3 className="profile-detail-item-title">
                            {tag.name}
                          </h3>
                          <div className="profile-detail-item-meta">
                            <span>{tag.count} {tag.count === 1 ? 'question' : 'questions'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="profile-detail-content-grid">
            <div className="profile-detail-content-main">
              <div className="profile-detail-section">
                <div className="profile-detail-section-header">
                  <h2 className="profile-detail-section-title">Activity</h2>
                  <div className="profile-detail-section-filters">
                    {['All', 'Questions', 'Answers', 'Comments'].map((filter) => (
                      <button
                        key={filter}
                        className="profile-detail-filter-button"
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Combined Activity Feed */}
                <div className="profile-detail-items-list">
                  {/* Questions Activity */}
                  {questions.length > 0 && questions.map((question: any) => (
                    <div key={`q-${question._id}`} className="profile-detail-item-card">
                      <div className="profile-detail-activity-header">
                        <span className="profile-detail-activity-type">📝 Asked a question</span>
                        <span className="profile-detail-activity-date">{formatDate(question.createdAt)}</span>
                      </div>
                      <Link
                        href={`/questions/${question._id}`}
                        className="profile-detail-item-card-link"
                      >
                        {question.title}
                      </Link>
                      <div className="profile-detail-item-meta">
                        <span>{question.votes || 0} votes</span>
                        <span>{question.answers || 0} answers</span>
                        <span>{question.views || 0} views</span>
                      </div>
                    </div>
                  ))}

                  {/* Answers Activity */}
                  {answers.length > 0 && answers.map((answer: any) => (
                    <div key={`a-${answer._id}`} className="profile-detail-item-card">
                      <div className="profile-detail-activity-header">
                        <span className="profile-detail-activity-type">💬 Answered</span>
                        <span className="profile-detail-activity-date">{formatDate(answer.createdAt)}</span>
                      </div>
                      <Link
                        href={`/questions/${answer.questionId._id}`}
                        className="profile-detail-item-card-link"
                      >
                        {answer.questionId?.title || 'Question'}
                      </Link>
                      <p className="profile-detail-item-body profile-detail-item-body-clamp-2">{answer.body}</p>
                      <div className="profile-detail-item-meta">
                        <span>{answer.votes || 0} votes</span>
                        {answer.isAccepted && (
                          <span className="profile-detail-item-accepted">✓ Accepted</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {questions.length === 0 && answers.length === 0 && (
                    <p className="profile-detail-empty-state">No activity yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'settings' && isOwnProfile && (
          <div className="profile-detail-content-grid">
            <div className="profile-detail-content-main">
              <div className="profile-detail-section">
                <div className="profile-detail-section-header">
                  <h2 className="profile-detail-section-title">Settings</h2>
                </div>
                
                {/* Change Role */}
                <div className="profile-detail-item-card">
                  <h3 className="profile-detail-item-title">Change My Role</h3>
                  <p className="profile-detail-item-body" style={{ marginBottom: '1rem', color: 'rgb(148, 163, 184)' }}>
                    Change your role between Student, Expert, or Admin
                  </p>
                  <div className="profile-detail-role-select-wrapper" style={{ marginTop: '1rem' }}>
                    <label className="profile-detail-role-select-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'rgb(203, 213, 225)' }}>
                      Select Role:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => handleChangeRole(e.target.value)}
                      disabled={isChangingRole}
                      className="profile-detail-role-select"
                      style={{ 
                        width: '100%', 
                        maxWidth: '300px',
                        padding: '0.5rem',
                        backgroundColor: 'rgb(30, 41, 59)',
                        border: '2px solid rgb(51, 65, 85)',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="user">👨‍🎓 Student</option>
                      <option value="expert">👨‍🏫 Expert</option>
                      <option value="admin">👨‍💼 Admin</option>
                    </select>
                    {isChangingRole && (
                      <p style={{ marginTop: '0.5rem', color: 'rgb(148, 163, 184)' }}>Changing...</p>
                    )}
                    {roleChangeSuccess && (
                      <p style={{ marginTop: '0.5rem', color: 'rgb(34, 197, 94)' }}>{roleChangeSuccess}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && !isOwnProfile && (
          <div className="profile-detail-section">
            <h2 className="profile-detail-section-title">Settings</h2>
            <p className="profile-detail-empty-state">You can only view your own settings</p>
          </div>
        )}
      </div>
    </div>
  );
}
