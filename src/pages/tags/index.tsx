'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';

interface Tag {
  name: string;
  count: number;
  description?: string;
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular'>('popular');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/questions', { 
        params: { page: 1, limit: 1000 }
      });
      
      const questions = response.data.questions || [];
      
      const tagMap: { [key: string]: number } = {};
      questions.forEach((q: any) => {
        if (q.tags && Array.isArray(q.tags)) {
          q.tags.forEach((tag: string) => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      });
      
      const tagsArray: Tag[] = Object.entries(tagMap).map(([name, count]) => ({
        name,
        count,
      }));
      
      if (sortBy === 'popular') {
        tagsArray.sort((a, b) => b.count - a.count);
      } else {
        tagsArray.sort((a, b) => a.name.localeCompare(b.name));
      }
      
      setTags(tagsArray);
    } catch (err: any) {
      console.error('Error fetching tags:', err);
      setError(err.response?.data?.error || 'Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [sortBy]);

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tags-page-container">
      <Sidebar />
      <main className="main-with-sidebar">
        <div className="questions-page-container">
          {/* Page Header */}
          <div className="tags-page-header">
            <div className="tags-page-header-row">
              <h1 className="tags-page-title">
                Tags
              </h1>
            </div>
            <div className="tags-page-header-info">
              <p className="tags-page-count-text">
                {tags.length} {tags.length === 1 ? 'tag' : 'tags'} in the system
              </p>
              <div className="tags-page-controls">
                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tags..."
                  className="tags-page-search-input"
                />
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
                  className="tags-page-sort-select"
                >
                  <option value="popular">Most Popular</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="questions-page-error">
              <p className="questions-page-error-text">⚠️ {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && tags.length === 0 ? (
            <div className="tags-skeleton-container">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="tags-skeleton-card">
                  <div className="tags-skeleton-content">
                    <div className="tags-skeleton-name"></div>
                    <div className="tags-skeleton-count"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="questions-page-empty">
              <div className="questions-page-empty-emoji">🏷️</div>
              <h3 className="questions-page-empty-title">
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="questions-page-empty-text">
                {searchQuery 
                  ? `No tags match "${searchQuery}"`
                  : 'Tags will appear here as questions are created with tags.'}
              </p>
            </div>
          ) : (
            <div className="tags-grid">
              {filteredTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                  className="tags-card"
                >
                  <div className="tags-card-header">
                    <span className="tags-card-name">
                      {tag.name}
                    </span>
                    <span className="tags-card-count">
                      {tag.count} {tag.count === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  {tag.description && (
                    <p className="tags-card-description">
                      {tag.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
