'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';

export default function QuestionsPage() {
  const router = useRouter();
  const { tag, search } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [filter, setFilter] = useState<'newest' | 'popular' | 'trending' | 'unanswered'>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const QUESTIONS_PER_PAGE = 10;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          // Silent fail, user is anonymous
        }
      }
    }
  }, [router]);

  useEffect(() => {
    if (tag && typeof tag === 'string') {
      setSelectedTag(tag);
    } else {
      setSelectedTag(null);
    }
    
    if (search && typeof search === 'string') {
      setSearchQuery(search);
    } else {
      setSearchQuery(null);
    }
  }, [tag, search]);

  useEffect(() => {
    if (mounted) {
      fetchQuestions();
    }
  }, [page, mounted, filter, selectedTag, searchQuery]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: QUESTIONS_PER_PAGE,
      };

      if (selectedTag) {
        params.tags = selectedTag;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filter === 'unanswered') {
        params.unanswered = true;
        params.answerCount = 0;
        params.sort = 'newest';
      } else if (filter === 'popular') {
        params.sort = 'votes';
        params.order = 'desc';
      } else if (filter === 'trending') {
        params.sort = 'trending';
        params.order = 'desc';
      } else {
        params.sort = 'newest';
        params.order = 'desc';
      }

      const response = await api.get('/questions', { params });

      let questions = response.data.questions || [];
      
      if (filter === 'unanswered') {
        questions = questions.filter((q: any) => {
          const answerCount = q.answerCount || q.answers?.length || 0;
          return answerCount === 0;
        });
      }

      if (filter === 'popular') {
        questions.sort((a: any, b: any) => {
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          if (bVotes !== aVotes) return bVotes - aVotes;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filter === 'newest') {
        questions.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      } else if (filter === 'trending') {
        questions.sort((a: any, b: any) => {
          const aVotes = a.votes || 0;
          const bVotes = b.votes || 0;
          const aIsNew = isNewQuestion(a.createdAt);
          const bIsNew = isNewQuestion(b.createdAt);
          const aScore = aVotes + (aIsNew ? 10 : 0);
          const bScore = bVotes + (bIsNew ? 10 : 0);
          if (bScore !== aScore) return bScore - aScore;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }

      setQuestions(questions);
      setTotalPages(response.data.totalPages || 1);
      setTotalQuestions(response.data.total || 0);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter: 'newest' | 'popular' | 'trending' | 'unanswered') => {
    setFilter(newFilter);
    setPage(1);
  };

  const isNewQuestion = (createdAt: string) => {
    const questionDate = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - questionDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  if (!mounted) {
    return (
      <div className="questions-loading-container">
        <div className="questions-loading-text">Loading...</div>
      </div>
    );
  }

  const showSidebar = user ? true : false;

  return (
    <div className="questions-page-container">
      {showSidebar && <Sidebar />}
      
      <main className={showSidebar ? "main-with-sidebar" : "questions-main"}>
        <div className="questions-main-content">
          {/* Page Header */}
          <div className="questions-page-header">
            <div className="questions-header-row">
              <h1 className="questions-page-title">
                {searchQuery ? (
                  <>
                    Search results for <span className="questions-page-title-tag">"{searchQuery}"</span>
                  </>
                ) : selectedTag ? (
                  <>
                    Questions tagged <span className="questions-page-title-tag">[{selectedTag}]</span>
                  </>
                ) : (
                  <>
                    {filter === 'newest' && 'Newest Questions'}
                    {filter === 'popular' && 'Active Questions'}
                    {filter === 'trending' && 'Trending Questions'}
                    {filter === 'unanswered' && 'Unanswered Questions'}
                  </>
                )}
              </h1>
              {(selectedTag || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setSearchQuery(null);
                    router.push('/questions', undefined, { shallow: true });
                  }}
                  className="questions-clear-filter-button"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="questions-header-info">
              <p className="questions-count-text">
                {totalQuestions.toLocaleString()} {totalQuestions === 1 ? 'question' : 'questions'} from the community
              </p>
              {/* Filter Options */}
              <div className="filter-bar-container">
                <div className="filter-container">
                  <div
                    onClick={() => handleFilterChange('newest')}
                    className={`filter-option ${filter === 'newest' ? 'filter-option-active' : ''}`}
                  >
                    Newest
                  </div>
                  <div
                    onClick={() => handleFilterChange('popular')}
                    className={`filter-option ${filter === 'popular' ? 'filter-option-active' : ''}`}
                  >
                    Active
                  </div>
                  <div
                    onClick={() => handleFilterChange('trending')}
                    className={`filter-option ${filter === 'trending' ? 'filter-option-active' : ''}`}
                  >
                    Trending
                  </div>
                  <div
                    onClick={() => handleFilterChange('unanswered')}
                    className={`filter-option ${filter === 'unanswered' ? 'filter-option-active' : ''}`}
                  >
                    Unanswered
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="questions-error-message">
              <p className="questions-error-text">⚠️ {error}</p>
            </div>
          )}

          {/* Loading - Skeleton Loader */}
          {loading && questions.length === 0 ? (
            <div className="questions-skeleton-container">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="questions-skeleton-card">
                  <div className="questions-skeleton-content">
                    <div className="questions-skeleton-stats">
                      <div className="questions-skeleton-stat-box"></div>
                      <div className="questions-skeleton-stat-box"></div>
                    </div>
                    <div className="questions-skeleton-main">
                      <div className="questions-skeleton-title"></div>
                      <div className="questions-skeleton-line"></div>
                      <div className="questions-skeleton-line questions-skeleton-line-short"></div>
                      <div className="questions-skeleton-tags">
                        <div className="questions-skeleton-tag"></div>
                        <div className="questions-skeleton-tag questions-skeleton-tag-large"></div>
                      </div>
                      <div className="questions-skeleton-meta"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="questions-empty-container">
              <div className="questions-empty-icon">📝</div>
              <h3 className="questions-empty-title">No questions yet</h3>
              <p className="questions-empty-text">Be the first to ask a question and start a discussion!</p>
              {user && (
                <Link 
                  href="/ask"
                  className="questions-empty-button"
                >
                  Ask Question
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Questions List */}
              <div className="questions-list">
                {questions.map((q: any, index: number) => (
                  <article
                    key={q._id}
                    className="questions-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link href={`/questions/${q._id}`} className="questions-card-link">
                      <div className="questions-card-content">
                        {/* Left Column - Metadata */}
                        <div className="questions-card-metadata">
                          {/* Question Type Icon */}
                          <div className="questions-card-type">
                            <svg className="questions-card-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="questions-card-type-text text-right-md">Question</span>
                          </div>
                          
                          {/* Stats */}
                          <div className="questions-card-stats text-right-md">
                            <div className="questions-card-stat">
                              <span className="questions-card-stat-bold">{q.votes || 0}</span> votes
                            </div>
                            <div className="questions-card-stat">
                              <span className="questions-card-stat-bold">{q.answerCount || 0}</span> replies
                            </div>
                            <div className="questions-card-stat">
                              <span className="questions-card-stat-bold">{q.views || 0}</span> views
                            </div>
                          </div>
                        </div>

                        {/* Right: Question Content */}
                        <div className="questions-card-main">
                          {/* Title */}
                          <h2 className="questions-card-title">
                            {q.title}
                          </h2>
                          
                          {/* Body Preview */}
                          <p 
                            className="questions-card-body line-clamp-2"
                            dangerouslySetInnerHTML={{
                              __html: q.body
                                .replace(
                                  /\[your image\]\((data:image\/[^)]+)\)/g,
                                  '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline"><img src="$1" alt="your image" class="max-w-xs rounded mt-2 mb-2 cursor-pointer inline-block" onclick="window.open(this.src, \'_blank\')" /></a>'
                                )
                                .replace(
                                  /\[([^\]]+)\]\(([^)]+)\)/g,
                                  '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline">$1</a>'
                                )
                            }}
                          />
                          
                          {/* Tags and Author Info */}
                          <div className="questions-card-footer">
                            {/* Tags */}
                            <div className="questions-card-tags">
                              {q.tags?.slice(0, 3).map((tag: string) => (
                                <Link
                                  key={tag}
                                  href={`/questions?tag=${encodeURIComponent(tag)}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTag(tag);
                                    setPage(1);
                                  }}
                                  className="questions-card-tag"
                                >
                                  {tag}
                                </Link>
                              ))}
                              {q.tags?.length > 3 && (
                                <span className="questions-card-tag-more">+{q.tags.length - 3} more</span>
                              )}
                            </div>
                            
                            {/* Author Info */}
                            <div className="questions-card-author">
                              <div className="questions-card-avatar">
                                {q.asker.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <Link 
                                href={`/profile/${q.asker._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="questions-card-author-link"
                              >
                                {q.asker.username}
                              </Link>
                              <span className="questions-card-author-separator">•</span>
                              <span className="questions-card-author-date">
                                asked {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="questions-pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="questions-pagination-button"
                  >
                    ← Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`questions-pagination-number ${
                          page === pageNum
                            ? 'questions-pagination-number-active'
                            : 'questions-pagination-number-inactive'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="questions-pagination-button"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
