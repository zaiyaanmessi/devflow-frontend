import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to DevFlow
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            A community-driven Q&A platform for developers
          </p>
          {!user ? (
            <div className="flex gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-white text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg"
              >
                Get Started
              </Link>
              <Link 
                href="/login" 
                className="border-2 border-white text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link 
              href="/ask" 
              className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg"
            >
              📝 Ask Your First Question
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Questions Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Latest Questions
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Link 
                    key={i}
                    href={`/questions/${i}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 mb-2">
                      How to use React hooks?
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      I'm trying to use useState but it's not working properly in my component...
                    </p>
                    <div className="flex gap-3 items-center text-sm text-gray-500">
                      <span>👁️ 150 views</span>
                      <span>💬 3 answers</span>
                      <span>👍 12 votes</span>
                      <span className="ml-auto">by john_doe</span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link 
                href="/search" 
                className="inline-block mt-6 text-blue-900 font-semibold hover:text-blue-700"
              >
                View all questions →
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS', 'Next.js'].map((tag) => (
                  <span 
                    key={tag}
                    className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: 'jane_doe', rep: 1250 },
                  { name: 'john_smith', rep: 980 },
                  { name: 'alex_dev', rep: 750 },
                ].map((contributor) => (
                  <Link 
                    key={contributor.name}
                    href={`/profile/${contributor.name}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="font-medium text-gray-900">{contributor.name}</span>
                    <span className="text-blue-900 font-semibold">⭐ {contributor.rep}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}