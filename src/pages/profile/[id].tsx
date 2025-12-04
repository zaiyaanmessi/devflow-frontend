import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [isSaving, setIsSaving] = useState(false);

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
      setEditData({
        username: response.data.username,
        bio: response.data.bio || ''
      });

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData.username.trim()) {
      setError('Username is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await api.put(`/users/${id}`, {
        username: editData.username,
        bio: editData.bio
      });

      setUser(response.data);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-gray-600">User not found</div>
          <Link href="/" className="text-blue-900 font-semibold hover:text-blue-700 mt-4 inline-block">
            ← Back to Home
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
    onUpdateProfile: handleUpdateProfile
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-6 border border-red-300">
            {error}
          </div>
        )}

       {/* Route to appropriate profile view based on PROFILE OWNER's role */}
       {userRole === 'admin' && (
          <AdminProfile {...commonProps} />
        )}

        {userRole === 'expert' && (
          <ExpertProfile {...commonProps} />
        )}

        {(!userRole || userRole === 'user') && (
          <StudentProfile {...commonProps} />
        )}
      </div>
    </div>
  );
}