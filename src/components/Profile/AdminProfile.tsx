/* eslint-disable @typescript-eslint/no-explicit-any */
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
      <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 sm:p-8 mb-6 border-l-4 border-cyan-500">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">{user.username}</h1>
                  <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    👨‍💼 Instructor
                  </span>
                </div>
                <p className="text-slate-400 mb-4">{user.bio || 'No bio'}</p>
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-cyan-500 text-white px-5 py-2.5 rounded-lg hover:bg-cyan-400 font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Admin Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <span className="font-bold text-white text-lg">{questions.length || 0}</span>
                <p className="text-sm text-slate-400 mt-1">Questions</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <span className="font-bold text-white text-lg">{answers.length || 0}</span>
                <p className="text-sm text-slate-400 mt-1">Answers</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <span className="font-bold text-cyan-400 text-lg">📊 {totalModeratedContent}</span>
                <p className="text-sm text-slate-400 mt-1">Moderated</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <span className="font-bold text-cyan-400 text-lg">🔒 Admin</span>
                <p className="text-sm text-slate-400 mt-1">Role</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onUpdateProfile}>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  placeholder="Tell us about your role..."
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-24"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-cyan-500 text-white px-6 py-2.5 rounded-lg hover:bg-cyan-400 font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-700 text-white px-6 py-2.5 rounded-lg hover:bg-slate-600 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Panel Info */}
      <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-3">👨‍💼 Admin Panel</h3>
        <p className="text-slate-400 mb-4">
          This user has full moderation and administrative capabilities including question locking,
          pinning, and content deletion.
        </p>
        <Link
          href="/admin"
          className="inline-block bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 font-semibold transition-colors"
        >
          Go to Admin Dashboard →
        </Link>
      </div>

      {/* Questions Section */}
      <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 sm:p-8 mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">
          Questions Asked by {user.username}
        </h2>
        {questions.length === 0 ? (
          <p className="text-slate-400">No questions yet</p>
        ) : (
          <div className="space-y-3">
            {questions.map((question: any) => (
              <Link
                key={question._id}
                href={`/questions/${question._id}`}
                className="block p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 border border-slate-600 hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-cyan-400 hover:text-cyan-300">
                      {question.title}
                    </h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {question.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          className="bg-slate-700/50 text-slate-300 px-2.5 py-1 rounded text-xs font-normal"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{question.votes || 0}</div>
                    <div className="text-xs text-slate-400">votes</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Answers Section */}
      <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl shadow-lg shadow-black/30 p-6 sm:p-8 border-t-4 border-cyan-500">
        <h2 className="text-2xl font-bold text-white mb-4">
          Answers Provided by {user.username}
        </h2>
        {answers.length === 0 ? (
          <p className="text-slate-400">No answers yet</p>
        ) : (
          <div className="space-y-3">
            {answers.map((answer: any) => (
              <div
                key={answer._id}
                className={`p-4 bg-slate-700/50 rounded-lg border-l-4 ${
                  answer.isAccepted ? 'border-green-500 bg-green-500/10' : 'border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <p className="text-sm font-semibold text-green-400 mb-2">
                        ✓ Accepted Answer
                      </p>
                    )}
                    <Link
                      href={`/questions/${answer.questionId._id}`}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      {answer.questionId.title}
                    </Link>
                    <p className="text-slate-400 text-sm mt-2 line-clamp-2">{answer.body}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{answer.votes || 0}</div>
                    <div className="text-xs text-slate-400">votes</div>
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