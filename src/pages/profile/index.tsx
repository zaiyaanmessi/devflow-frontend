import Link from 'next/link';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          console.log('Failed to parse user data');
        }
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 leading-tight">
            Ask. Learn. Grow.
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Connect with developers worldwide. Ask questions, share knowledge, and solve problems together.
          </p>
          {!user ? (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link 
                href="/register" 
                className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 text-lg shadow-lg"
              >
                Get Started Free
              </Link>
              <Link 
                href="/login" 
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-all text-lg"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link 
              href="/ask" 
              className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 text-lg shadow-lg"
            >
              📝 Ask Your Question
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Questions Section - Left */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Latest Questions</h2>
              <Link 
                href="/search" 
                className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
              >
                See all <span>→</span>
              </Link>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Link 
                  key={i}
                  href={`/questions/${i}`}
                  className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all group"
                >
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 mb-2">
                        How to use React hooks effectively?
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        I'm trying to use useState and useEffect but I'm getting unexpected behavior. Can someone explain the best practices?
                      </p>
                      <div className="flex gap-3 items-center flex-wrap">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">React</span>
                        <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">JavaScript</span>
                      </div>
                    </div>
                    <div className="text-right min-w-20">
                      <div className="text-2xl font-bold text-gray-900">12</div>
                      <div className="text-xs text-gray-600">votes</div>
                      <div className="text-2xl font-bold text-gray-900 mt-3">3</div>
                      <div className="text-xs text-gray-600">answers</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar - Right */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'Node.js', 'TypeScript', 'CSS', 'Next.js', 'Python'].map((tag) => (
                  <span 
                    key={tag}
                    className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h3>
              <div className="space-y-3">
                {[
                  { name: 'sarah_dev', rep: 1250, icon: '👩‍💻' },
                  { name: 'john_smith', rep: 980, icon: '👨‍💻' },
                  { name: 'alex_coder', rep: 750, icon: '🧑‍💻' },
                ].map((contributor) => (
                  <Link 
                    key={contributor.name}
                    href={`/profile/${contributor.name}`}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{contributor.icon}</span>
                      <span className="font-medium text-gray-900">{contributor.name}</span>
                    </div>
                    <span className="text-blue-600 font-bold text-sm">⭐ {contributor.rep}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Questions</span>
                  <span className="font-bold">2,450+</span>
                </div>
                <div className="flex justify-between">
                  <span>Answers</span>
                  <span className="font-bold">8,930+</span>
                </div>
                <div className="flex justify-between">
                  <span>Members</span>
                  <span className="font-bold">1,240+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}