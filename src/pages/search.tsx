import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Search() {
  const router = useRouter();
  const { query: searchQuery } = router.query;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Set initial query from URL
  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery as string);
      fetchResults(searchQuery as string, 1);
    }
  }, [searchQuery]);

  const fetchResults = async (searchTerm: string, pageNum: number) => {
    if (!searchTerm.trim()) {
      setError('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      console.log('Searching Stack Overflow for:', searchTerm);

      const response = await fetch(
        `https://api.stackexchange.com/2.3/search/advanced?site=stackoverflow&title=${encodeURIComponent(searchTerm)}&pagesize=10&page=${pageNum}&order=desc&sort=relevance`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      
      console.log('Stack Overflow API response:', data);

      setResults(data.items || []);
      setHasMore(data.has_more || false);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError(err.message || 'Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
      fetchResults(query, 1);
    }
  };

  const handleLoadMore = () => {
    if (query.trim()) {
      fetchResults(query, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Stack Overflow</h1>
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for questions on Stack Overflow..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Search
            </button>
          </form>
          <p className="text-sm text-gray-600">
            💡 Tip: Search for coding topics like "react hooks", "javascript async await", "python decorators", etc.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-6 border border-red-300">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-600">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <p className="mt-4">Searching Stack Overflow...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Found {results.length} Result{results.length !== 1 ? 's' : ''}
              </h2>

              <div className="space-y-4">
                {results.map((result: any) => (
                  <a
                    key={result.question_id}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex justify-between gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-blue-600 group-hover:text-blue-700 flex-1">
                        {result.title}
                      </h3>
                      <div className="text-right min-w-20 flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-900">{result.score}</div>
                        <div className="text-xs text-gray-600">votes</div>
                      </div>
                    </div>

                    <div className="flex gap-3 items-center flex-wrap mb-3">
                      {result.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {result.tags?.length > 3 && (
                        <span className="text-xs text-gray-600">
                          +{result.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 items-center text-sm text-gray-600 flex-wrap">
                      <span>👁️ {result.view_count} views</span>
                      <span>💬 {result.answer_count} answer{result.answer_count !== 1 ? 's' : ''}</span>
                      {result.is_answered && (
                        <span className="text-green-600 font-semibold">✓ Has Answer</span>
                      )}
                      <span className="text-gray-500">by {result.owner.display_name}</span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Load More / Pagination */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="bg-blue-900 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold disabled:bg-gray-400"
                  >
                    {loading ? 'Loading...' : 'Load More Results'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && !error && (
          <div className="text-center py-8 text-gray-600">
            <p className="text-lg">No results found for "{query}"</p>
            <p className="text-sm mt-2">Try searching for different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && results.length === 0 && !error && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg font-semibold mb-2">Start Searching</p>
            <p className="text-sm">Enter a search term above to find Stack Overflow questions</p>
          </div>
        )}
      </div>
    </div>
  );
}