import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, Question } from '@/types';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Get logged-in user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // TODO: Fetch user's questions
      // const response = await userAPI.getQuestions(user._id);
      // setQuestions(response.data.questions);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">Please log in to view your profile</p>
          <Link href="/login" className="text-blue-900 font-semibold hover:text-blue-700">
            Go to login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <p className="text-gray-600 mb-4">{user.bio || 'No bio yet'}</p>
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
            <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Questions</h2>
          {questions.length === 0 ? (
            <p className="text-gray-600">
              You haven't asked any questions yet.{' '}
              <Link href="/ask" className="text-blue-900 font-semibold">
                Ask one now!
              </Link>
            </p>
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
                    <span>👁️ {q.views} views</span>
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