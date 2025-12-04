import Link from 'next/link';

interface StudentProfileProps {
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

export default function StudentProfile({
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
}: StudentProfileProps) {
  return (
    <>
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.username}</h1>
                <p className="text-gray-600 mb-4">{user.bio || 'No bio'}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6 text-lg">
              <div>
                <span className="font-bold text-gray-900">⭐ {user.reputation}</span>
                <p className="text-sm text-gray-600">Reputation</p>
              </div>
              <div>
                <span className="font-bold text-gray-900">{questions.length || 0}</span>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div>
                <span className="font-bold text-gray-900">{answers.length || 0}</span>
                <p className="text-sm text-gray-600">Answers</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-colors disabled:bg-gray-400"
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

      {/* Questions Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions by {user.username}</h2>
        {questions.length === 0 ? (
          <p className="text-gray-600">No questions yet</p>
        ) : (
          <div className="space-y-3">
            {questions.map((question: any) => (
              <Link
                key={question._id}
                href={`/questions/${question._id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors"
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
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
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
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Answers by {user.username}</h2>
        {answers.length === 0 ? (
          <p className="text-gray-600">No answers yet</p>
        ) : (
          <div className="space-y-3">
            {answers.map((answer: any) => (
              <div
                key={answer._id}
                className={`p-4 bg-gray-50 rounded-lg border-l-4 ${
                  answer.isAccepted ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <p className="text-sm font-semibold text-green-600 mb-2">✓ Accepted</p>
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