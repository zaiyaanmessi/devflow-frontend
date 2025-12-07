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

  // ⭐ NEW - Role change state
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
      setSelectedRole(response.data.role); // ⭐ NEW
      setEditData({
        username: response.data.username,
        bio: response.data.bio || '',
        location: response.data.location || '',
        title: response.data.title || ''
      });
      
      // Set profile image preview if user has a profile picture
      if (response.data.profilePicture) {
        setProfileImagePreview(response.data.profilePicture);
      }

      // Fetch user's questions
      const questionsRes = await api.get(`/users/${id}/questions`);
      setQuestions(questionsRes.data.questions || []);

      // Fetch user's answers
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
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and GIF images are supported.');
        return;
      }

      // Validate file size (2 MiB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Image size must be less than 2 MiB.');
        return;
      }

      setProfileImage(file);
      setError('');

      // Create preview
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
      
      // Convert image to base64 if a new image was selected
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
      
      // Update preview if profile picture was updated
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

  // ⭐ NEW - Handle role change
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
      
      // Update localStorage if it's the current user
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

      // Clear success message after 3 seconds
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
      <div className="min-h-screen bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-slate-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-slate-400">User not found</div>
          <Link href="/questions" className="text-cyan-400 font-semibold hover:text-cyan-300 mt-4 inline-block">
            ← Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  // Common props for all profile views
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
    // ⭐ NEW
    selectedRole,
    isChangingRole,
    onChangeRole: handleChangeRole,
    canChangeRole: isOwnProfile || currentUserRole === 'admin'
  };

  // Format date helper
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

  // Calculate member since
  const memberSince = user.createdAt ? formatDate(user.createdAt) : 'N/A';

  // If editing, show edit profile page
  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 border border-red-500/50">
              {error}
            </div>
          )}

          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-white mb-6">Public information</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Settings Navigation */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Email Settings</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-cyan-400 hover:text-cyan-300">Edit email settings</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Tag watching & ignoring</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Community digests</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Question subscriptions</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Site Settings</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-slate-300 hover:text-white">Preferences</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Flair</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Hide communities</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Access</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-slate-300 hover:text-white">Collectives</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Logins</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">Data dump access</a></li>
                      <li><a href="#" className="text-slate-300 hover:text-white">RSS feeds</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">API</h3>
                    <ul className="space-y-2 text-sm">
                      <li><a href="#" className="text-slate-300 hover:text-white">Authorized applications</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Right Column - Profile Edit Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Profile Image */}
                  <div>
                    <div className="w-32 h-32 bg-gradient-to-br from-cyan-500 to-slate-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {user.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm font-medium transition-colors"
                    >
                      Change picture
                    </button>
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Display name</label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="Add location"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="No title has been set"
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  {/* About Me */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">About me</label>
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={8}
                      className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-400 font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
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
                      className="bg-slate-700 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 font-semibold transition-colors"
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
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 border border-red-500/50">
            {error}
          </div>
        )}

        {roleChangeSuccess && (
          <div className="bg-green-500/20 text-green-400 p-4 rounded-lg mb-6 border border-green-500/50">
            {roleChangeSuccess}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 mb-4">
          <div className="flex gap-6 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500 to-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.profilePicture || profileImagePreview ? (
                <img 
                  src={user.profilePicture || profileImagePreview || ''} 
                  alt={user.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl font-bold text-white">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{user.username}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                  userRole === 'admin' ? 'bg-red-500' :
                  userRole === 'expert' ? 'bg-purple-500' :
                  'bg-slate-600'
                }`}>
                  {userRole === 'admin' ? '👨‍💼 Admin' :
                   userRole === 'expert' ? '👨‍🏫 Expert' :
                   '👨‍🎓 Student'}
                </span>
              </div>
              <div className="space-y-1 text-sm text-slate-400">
                <p>Member since {memberSince}</p>
                <p>Last seen {memberSince}</p>
                <p>Visited 1 day, 1 consecutive</p>
              </div>
            </div>

            {/* Action Buttons */}
<div className="flex flex-col gap-2">
  {isOwnProfile && (
    <button
      onClick={() => setIsEditing(true)}
      className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 text-sm font-medium transition-colors whitespace-nowrap"
    >
      Edit profile
    </button>
  )}
  {(isOwnProfile || currentUserRole === 'admin') && (
    <div className="bg-slate-700 rounded-lg p-2">
      <label className="text-xs font-medium text-slate-300 mb-1 block">Change Role:</label>
      <select
        value={selectedRole}
        onChange={(e) => handleChangeRole(e.target.value)}
        disabled={isChangingRole}
        className="w-full px-2 py-1.5 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex gap-1 border-b border-slate-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Activity
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab('saves')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'saves'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Saves
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Settings
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Area - Two Column Layout */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Sub Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-4">
                <h2 className="text-lg font-bold text-white mb-4">Summary</h2>
                <nav className="space-y-1">
                  {['summary', 'answers', 'questions', 'tags'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab as any)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        activeSubTab === tab
                          ? 'bg-cyan-500/20 text-cyan-400 font-medium'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              {activeSubTab === 'summary' && (
                <div className="space-y-4">
                  {/* Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-white">Reputation</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Reputation is how the community thanks you. Upvotes earn reputation and unlock privileges.
                      </p>
                      <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm">Learn more about reputation</a>
                    </div>

                    <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-white">Badges</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        Earn badges for helpful actions. Badges are digital flair for helpful participation.
                      </p>
                      <button className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 text-sm font-medium transition-colors">
                        Take the Tour
                      </button>
                    </div>

                    <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-white">Impact</h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        Your posts and actions help thousands of people find answers.
                      </p>
                    </div>
                  </div>

                  {/* Answers Section */}
                  <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Answers</h2>
                      <div className="flex gap-2 text-sm">
                        {['Score', 'Activity', 'Newest', 'Views'].map((filter) => (
                          <button
                            key={filter}
                            className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    {answers.length === 0 ? (
                      <p className="text-slate-400">No answers yet</p>
                    ) : (
                      <div className="space-y-3">
                        {answers.slice(0, 5).map((answer: any) => (
                          <div key={answer._id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                            <Link
                              href={`/questions/${answer.questionId._id}`}
                              className="text-cyan-400 hover:text-cyan-300 font-medium"
                            >
                              {answer.questionId?.title || 'Question'}
                            </Link>
                            <p className="text-slate-400 text-sm mt-2 line-clamp-2">{answer.body}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                              <span>{answer.votes || 0} votes</span>
                              {answer.isAccepted && (
                                <span className="text-green-400">✓ Accepted</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Questions Section */}
                  <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Questions</h2>
                      <div className="flex gap-2 text-sm">
                        {['Score', 'Activity', 'Newest', 'Views'].map((filter) => (
                          <button
                            key={filter}
                            className="px-3 py-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    {questions.length === 0 ? (
                      <p className="text-slate-400">No questions yet</p>
                    ) : (
                      <div className="space-y-3">
                        {questions.slice(0, 5).map((question: any) => (
                          <Link
                            key={question._id}
                            href={`/questions/${question._id}`}
                            className="block p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-colors"
                          >
                            <h3 className="text-cyan-400 hover:text-cyan-300 font-medium mb-2">
                              {question.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
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
                <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">All Answers</h2>
                  {answers.length === 0 ? (
                    <p className="text-slate-400">No answers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {answers.map((answer: any) => (
                        <div key={answer._id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                          <Link
                            href={`/questions/${answer.questionId._id}`}
                            className="text-cyan-400 hover:text-cyan-300 font-medium"
                          >
                            {answer.questionId?.title || 'Question'}
                          </Link>
                          <p className="text-slate-400 text-sm mt-2 line-clamp-3">{answer.body}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                            <span>{answer.votes || 0} votes</span>
                            {answer.isAccepted && (
                              <span className="text-green-400">✓ Accepted</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSubTab === 'questions' && (
                <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">All Questions</h2>
                  {questions.length === 0 ? (
                    <p className="text-slate-400">No questions yet</p>
                  ) : (
                    <div className="space-y-3">
                      {questions.map((question: any) => (
                        <Link
                          key={question._id}
                          href={`/questions/${question._id}`}
                          className="block p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-cyan-500/50 transition-colors"
                        >
                          <h3 className="text-cyan-400 hover:text-cyan-300 font-medium mb-2">
                            {question.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
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
                <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Tags</h2>
                  <p className="text-slate-400">Tag activity will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Activity</h2>
            <p className="text-slate-400">Activity feed will appear here</p>
          </div>
        )}

        {activeTab === 'saves' && (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Saves</h2>
            <p className="text-slate-400">Saved items will appear here</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            <p className="text-slate-400">Settings will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}