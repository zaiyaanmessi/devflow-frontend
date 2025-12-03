import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Question } from '@/types';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // TODO: Replace with actual API call
    // const fetchUser = async () => {
    //   const response = await userAPI.getProfile(id as string);
    //   setUser(response.data);
    //   const qResponse = await userAPI.getQuestions(id as string);
    //   setQuestions(qResponse.data.questions);
    // };

    // MOCK DATA
    setUser({
      _id: id as string,
      username: 'john_doe',
      email: 'john@example.com',
      reputation: 250,
      role: 'user',
      bio: 'Full stack developer with 5 years of experience',
    });

    setQuestions([
      {
        _id: '1',
        title: 'How to use React hooks?',
        body: '',
        asker: null as any,
        tags: ['react'],
        votes: 12,
        views: 150,
        answers: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <div className="text-center py-8">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.bio || 'No bio'}</p>
            <div className="flex gap-6 text-lg">
              <div>
                <span className="font-bold text-gray-900">⭐ {user.reputation}</span>
                <p className="text-sm text-gray-600">Reputation</p>
              </div>
              <div>
                <span className="font-bold text-gray-900">{questions.length}</span>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions by {user.username}</h2>
          {questions.length === 0 ? (
            <p className="text-gray-600">No questions yet</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <Link
                  key={q._id}
                  href={`/questions/${q._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <h3 className="font-semibold text-blue-900 hover:text-blue-700 mb-2">{q.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>👍 {q.votes} votes</span>
                    <span>💬 {q.answers} answers</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}