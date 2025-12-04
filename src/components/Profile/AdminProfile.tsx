import Link from 'next/link';

interface AdminProfileProps {
  user: any;
  userRole: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
  questions: any[];
  answers: any[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  editData: { username: string; bio: string };
  setEditData: (data: { username: string; bio: string }) => void;
  isSaving: boolean;
  error: string;
  setError: (error: string) => void;
  onUpdateProfile: (e: React.FormEvent) => Promise<void>;
}

export default function AdminProfile({
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
  onUpdateProfile
}: AdminProfileProps) {
  // Calculate admin stats
  const totalModeratedContent = questions.length + answers.length;

  return (
    <>
      {/* Admin Header with Instructor Badge */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg shadow-md p-8 mb-8 border-l-4 border-red-500">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900">{user.username}</h1>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    👨‍💼 Instructor
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{user.bio || 'No bio'}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-5 gap-4 text-lg">
              <div className="bg-white rounded-lg p-4">
                <span className="font-bold text-gray-900">⭐ {user.reputation}</span>
                <p className="text-sm text-gray-600">Reputation</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <span className="font-bold text-gray-900">{questions.length || 0}</span>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <span className="font-bold text-gray-900">{answers.length || 0}</span>
                <p className="text-sm text-gray-600">Answers</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <span className="font-bold text-red-600">📊 {totalModeratedContent}</span>
                <p className="text-sm text-gray-600">Moderated</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <span className="font-bold text-red-600">🔒 Admin</span>
                <p className="text-sm text-gray-600">Role</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onUpdateProfile}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about your role..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 h-24"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Panel Info */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-bold text-red-900 mb-3">👨‍💼 Admin Panel</h3>
        <p className="text-red-800 mb-4">
          This user has full moderation and administrative capabilities including question locking,
          pinning, and content deletion.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
        >
          Go to Admin Dashboard →
        </Link>
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Questions Asked by {user.username}
        </h2>
        {questions.length === 0 ? (
          <p className="text-gray-600">No questions yet</p>
        ) : (
          <div className="space-y-3">
            {questions.map((question: any) => (
              <Link
                key={question._id}
                href={`/questions/${question._id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                      {question.title}
                    </h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {question.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{question.votes || 0}</div>
                    <div className="text-xs text-gray-600">votes</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Answers Section */}
      <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-red-500">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Answers Provided by {user.username}
        </h2>
        {answers.length === 0 ? (
          <p className="text-gray-600">No answers yet</p>
        ) : (
          <div className="space-y-3">
            {answers.map((answer: any) => (
              <div
                key={answer._id}
                className={`p-4 bg-gray-50 rounded-lg border-l-4 ${
                  answer.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <p className="text-sm font-semibold text-green-600 mb-2">
                        ✓ Accepted Answer
                      </p>
                    )}
                    <Link
                      href={`/questions/${answer.questionId._id}`}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      {answer.questionId.title}
                    </Link>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{answer.body}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{answer.votes || 0}</div>
                    <div className="text-xs text-gray-600">votes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}