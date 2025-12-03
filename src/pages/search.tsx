import Link from 'next/link';
import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results] = useState([
    { id: 1, title: 'How to use React hooks?', tags: ['react', 'javascript'], votes: 12, answers: 3 },
    { id: 2, title: 'Best practices for Node.js', tags: ['nodejs', 'javascript'], votes: 8, answers: 5 },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Will connect to backend later
    console.log('Search:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Questions</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for questions..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {results.length} Results
          </h2>

          {results.map((result) => (
            <Link
              key={result.id}
              href={`/questions/${result.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:border-blue-300 border border-transparent transition-all group"
            >
              <h3 className="text-lg font-semibold text-blue-900 group-hover:text-blue-700 mb-2">
                {result.title}
              </h3>
              <div className="flex gap-4 items-center text-sm text-gray-600">
                <span className="flex gap-1 flex-wrap">
                  {result.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 text-blue-900 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </span>
                <span>👍 {result.votes} votes</span>
                <span>💬 {result.answers} answers</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}