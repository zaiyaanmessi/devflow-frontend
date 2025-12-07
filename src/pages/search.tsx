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
    <div className="search-page-container">
      <div className="search-page-main">
        {/* Search Form */}
        <div className="search-form-container">
          <div className="search-form-header">
            <div className="search-form-header-content">
              <h1 className="search-form-title">Search Stack Overflow</h1>
              <p className="search-form-subtitle">Find questions and answers from the Stack Overflow community</p>
            </div>
            {/* API Status Indicator */}
            {(quotaRemaining !== null || backoffRemaining !== null) && (
              <div className="search-api-status">
                {quotaRemaining !== null && (
                  <div className="search-api-status-item">
                    Quota: <span className={quotaRemaining < 100 ? 'search-api-quota-low' : 'search-api-quota-good'}>{quotaRemaining}</span>
                  </div>
                )}
                {backoffRemaining !== null && (
                  <div className="search-api-backoff">
                    Backoff: {backoffRemaining}s
                  </div>
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for questions... (e.g., react hooks, async await)"
                className="search-input"
                disabled={loading || (backoffRemaining !== null && backoffRemaining > 0)}
              />
              {loading && (
                <div className="search-input-loading">
                  <div className="search-input-spinner"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || (backoffRemaining !== null && backoffRemaining > 0)}
              className="search-submit-button"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
          <div className="search-form-footer">
            <p className="search-form-tip">
              💡 Tip: Search for coding topics like "react hooks", "javascript async await", "python decorators", etc.
            </p>
            {backoffRemaining !== null && backoffRemaining > 0 && (
              <p className="search-form-rate-limit">
                ⚠️ Rate limited. Please wait {backoffRemaining} seconds.
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="search-error">
            <p className="search-error-text">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="search-loading-container">
            <div className="search-loading-spinner-wrapper">
              <div className="search-loading-spinner"></div>
            </div>
            <p className="search-loading-text">Searching Stack Overflow...</p>
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <>
            <div className="search-results-section">
              <h2 className="search-results-title">
                Found {results.length} Result{results.length !== 1 ? 's' : ''}
              </h2>

              <div className="search-results-list">
                {results.map((result: StackOverflowQuestion) => (
                  <a
                    key={result.question_id}
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="search-result-card"
                  >
                    <div className="search-result-header">
                      <h3 className="search-result-title">
                        {result.title}
                      </h3>
                      <div className="search-result-stats">
                        <div className="search-result-score">
                          <div className="search-result-score-value">{result.score}</div>
                          <div className="search-result-score-label">votes</div>
                        </div>
                        {result.is_answered && (
                          <div className="search-result-answered">
                            <svg className="search-result-answered-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="search-result-answered-text">Answered</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="search-result-tags">
                      {result.tags?.slice(0, 5).map((tag: string) => (
                        <span
                          key={tag}
                          className="search-result-tag"
                        >
                          {tag}
                        </span>
                      ))}
                      {result.tags && result.tags.length > 5 && (
                        <span className="search-result-tag-more">
                          +{result.tags.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="search-result-meta">
                      <span className="search-result-meta-item">
                        <svg className="search-result-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {result.view_count.toLocaleString()} views
                      </span>
                      <span className="search-result-meta-item">
                        <svg className="search-result-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {result.answer_count} answer{result.answer_count !== 1 ? 's' : ''}
                      </span>
                      {result.owner && (
                        <span className="search-result-meta-item">
                          <svg className="search-result-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {result.owner.display_name}
                        </span>
                      )}
                      <span className="search-result-meta-date">
                        {new Date(result.creation_date * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>

              {/* Load More / Pagination */}
              {hasMore && (
                <div className="search-load-more-container">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="search-load-more-button"
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
          <div className="search-no-results">
            <div className="search-no-results-emoji">🔍</div>
            <p className="search-no-results-title">No results found for "{query}"</p>
            <p className="search-no-results-text">Try searching for different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !query && results.length === 0 && !error && (
          <div className="search-empty-state">
            <div className="search-empty-state-emoji">🚀</div>
            <p className="search-empty-state-title">Start Searching</p>
            <p className="search-empty-state-text">Enter a search term above to find Stack Overflow questions</p>
          </div>
        )}
      </div>
    </div>
  );
}
