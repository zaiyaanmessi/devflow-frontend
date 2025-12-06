import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';
import { searchStackOverflow, getQuotaRemaining, getBackoffRemaining, isApiAvailable, StackOverflowQuestion } from '@/services/stackoverflowApi';
import { useDebounce } from '@/hooks/useDebounce';

export default function Search() {
  const router = useRouter();
  const { query: searchQuery } = router.query;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StackOverflowQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null);
  const [backoffRemaining, setBackoffRemaining] = useState<number | null>(null);
  
  // Refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const lastFetchedQuery = useRef<string>('');
  
  // Debounce search query for better UX (only search after user stops typing)
  const debouncedQuery = useDebounce(query, 500);

  const fetchResults = useCallback(async (searchTerm: string, pageNum: number) => {
    if (!searchTerm.trim()) {
      setError('Please enter a search query');
      return;
    }

    // Prevent duplicate calls for the same query and page
    const queryKey = `${searchTerm}-${pageNum}`;
    if (lastFetchedQuery.current === queryKey && loading) {
      return;
    }

    // Check API availability
    if (!isApiAvailable()) {
      const remaining = getBackoffRemaining();
      setError(remaining 
        ? `Rate limited. Please wait ${remaining} seconds before trying again.`
        : 'API is temporarily unavailable. Please try again later.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');
      lastFetchedQuery.current = queryKey;
      
      const response = await searchStackOverflow(searchTerm, {
        page: pageNum,
        pageSize: 10,
        sort: 'relevance',
        order: 'desc',
      });

      // Update results
      if (pageNum === 1) {
        setResults(response.items || []);
      } else {
        setResults(prev => [...prev, ...(response.items || [])]);
      }
      
      setHasMore(response.has_more || false);
      setPage(pageNum);
      setQuotaRemaining(response.quota_remaining);
      
      // Update URL without triggering navigation - only if different from current
      // Use replace to avoid adding to history, and shallow to prevent re-render
      if (pageNum === 1) {
        const newUrl = `/search?query=${encodeURIComponent(searchTerm)}`;
        const currentPath = router.asPath.split('?')[0];
        if (currentPath === '/search' && router.query.query !== searchTerm) {
          router.replace(newUrl, undefined, { shallow: true });
        }
      }
    } catch (err: any) {
      console.error('Error fetching Stack Overflow results:', err);
      setError(err.message || 'Failed to search. Please try again.');
      
      // Update backoff info if available
      setBackoffRemaining(getBackoffRemaining());
      lastFetchedQuery.current = ''; // Reset on error
    } finally {
      setLoading(false);
    }
  }, [router, loading]);

  // Set initial query from URL - only run once when component mounts or searchQuery changes
  useEffect(() => {
    if (searchQuery && typeof searchQuery === 'string') {
      const queryString = searchQuery;
      if (query !== queryString && !loading) {
        setQuery(queryString);
        setPage(1);
        setResults([]);
        lastFetchedQuery.current = ''; // Reset to allow fetch
        fetchResults(queryString, 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Auto-search when debounced query changes (only if query is not from URL and user is typing)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only auto-search if:
    // 1. There's a debounced query
    // 2. It's different from the current query state
    // 3. It's not coming from URL (no searchQuery in URL)
    // 4. We're not already loading
    if (
      debouncedQuery && 
      debouncedQuery.trim() && 
      !searchQuery && 
      debouncedQuery !== query &&
      !loading
    ) {
      setPage(1);
      setResults([]);
      lastFetchedQuery.current = ''; // Reset to allow fetch
      fetchResults(debouncedQuery, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Update quota and backoff info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setQuotaRemaining(getQuotaRemaining());
      setBackoffRemaining(getBackoffRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchResults(query, 1);
    }
  };

  const handleLoadMore = () => {
    if (query.trim() && !loading) {
      fetchResults(query, page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Search Form */}
        <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl shadow-lg shadow-black/30 p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Search Stack Overflow</h1>
              <p className="text-slate-400">Find questions and answers from the Stack Overflow community</p>
            </div>
            {/* API Status Indicator */}
            {(quotaRemaining !== null || backoffRemaining !== null) && (
              <div className="hidden sm:flex flex-col items-end text-xs">
                {quotaRemaining !== null && (
                  <div className="text-slate-400 mb-1">
                    Quota: <span className={quotaRemaining < 100 ? 'text-yellow-400' : 'text-green-400'}>{quotaRemaining}</span>
                  </div>
                )}
                {backoffRemaining !== null && (
                  <div className="text-yellow-400">
                    Backoff: {backoffRemaining}s
                  </div>
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for questions... (e.g., react hooks, async await)"
                className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 text-white placeholder-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                disabled={loading || (backoffRemaining !== null && backoffRemaining > 0)}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-cyan-400"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || (backoffRemaining !== null && backoffRemaining > 0)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-semibold whitespace-nowrap shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-slate-400">
              💡 Tip: Search for coding topics like "react hooks", "javascript async await", "python decorators", etc.
            </p>
            {backoffRemaining !== null && backoffRemaining > 0 && (
              <p className="text-xs text-yellow-400">
                ⚠️ Rate limited. Please wait {backoffRemaining} seconds.
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/15 border-l-4 border-red-400 text-red-300 p-5 rounded-r-xl mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-slate-400">
            <div className="inline-block mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-cyan-500"></div>
            </div>
            <p className="text-lg">Searching Stack Overflow...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Found {results.length} Result{results.length !== 1 ? 's' : ''}
              </h2>

              <div className="space-y-4">
                {results.map((result: StackOverflowQuestion) => (
                  <a
                    key={result.question_id}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-6 bg-slate-800/80 border-2 border-slate-700 hover:border-cyan-500/50 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-cyan-500/20 transition-all group"
                  >
                    <div className="flex justify-between gap-4 mb-3 flex-col sm:flex-row">
                      <h3 className="text-lg font-semibold text-cyan-400 group-hover:text-cyan-300 flex-1 line-clamp-2">
                        {result.title}
                      </h3>
                      <div className="flex gap-4 sm:flex-col sm:items-end flex-shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{result.score}</div>
                          <div className="text-xs text-slate-400">votes</div>
                        </div>
                        {result.is_answered && (
                          <div className="flex items-center gap-1 text-green-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold">Answered</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center flex-wrap mb-4">
                      {result.tags?.slice(0, 5).map((tag: string) => (
                        <span
                          key={tag}
                          className="inline-block bg-slate-700/50 text-cyan-300 px-3 py-1 rounded-full text-xs font-medium hover:bg-slate-700 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                      {result.tags && result.tags.length > 5 && (
                        <span className="text-xs text-slate-400">
                          +{result.tags.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 items-center text-sm text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {result.view_count.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {result.answer_count} answer{result.answer_count !== 1 ? 's' : ''}
                      </span>
                      {result.owner && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {result.owner.display_name}
                        </span>
                      )}
                      <span className="text-slate-500">
                        {new Date(result.creation_date * 1000).toLocaleDateString()}
                      </span>
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
                    className="bg-cyan-500 text-white px-8 py-3 rounded-lg hover:bg-cyan-400 transition-colors font-semibold disabled:bg-slate-700 disabled:cursor-not-allowed"
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
          <div className="text-center py-12 text-slate-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold text-white">No results found for "{query}"</p>
            <p className="text-sm mt-2">Try searching for different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && results.length === 0 && !error && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-6xl mb-4">🚀</div>
            <p className="text-lg font-semibold text-white mb-2">Start Searching</p>
            <p className="text-sm">Enter a search term above to find Stack Overflow questions</p>
          </div>
        )}
      </div>
    </div>
  );
}
