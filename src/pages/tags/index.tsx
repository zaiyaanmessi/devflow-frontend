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
      
      // Fetch all questions to extract tags
      const response = await api.get('/questions', { 
        params: { page: 1, limit: 1000 } // Get many questions to extract all tags
      });
      
      const questions = response.data.questions || [];
      
      // Extract and count tags
      const tagMap: { [key: string]: number } = {};
      questions.forEach((q: any) => {
        if (q.tags && Array.isArray(q.tags)) {
          q.tags.forEach((tag: string) => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
          });
        }
      });
      
      // Convert to array and sort
      const tagsArray: Tag[] = Object.entries(tagMap).map(([name, count]) => ({
        name,
        count,
      }));
      
      // Sort by count (popular) or name
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
    <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="main-with-sidebar">
        <div className="questions-page-container">
          {/* Page Header */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Tags
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
              <p className="text-xl font-normal text-gray-400 tracking-normal">
                {tags.length} {tags.length === 1 ? 'tag' : 'tags'} in the system
              </p>
              <div className="flex gap-4 items-center">
                {/* Search */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter tags..."
                  className="px-4 py-2 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'popular')}
                  className="px-4 py-2 bg-slate-800/50 border-2 border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                >
                  <option value="popular">Most Popular</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/15 border-l-4 border-red-400 text-red-300 p-6 rounded-r-xl mb-10 sm:mb-12">
              <p className="font-medium text-base tracking-normal">⚠️ {error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && tags.length === 0 ? (
            <div className="space-y-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="bg-slate-700 rounded h-6 w-32"></div>
                    <div className="bg-slate-700 rounded h-4 w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-20 sm:p-24 md:p-32 lg:p-40 text-center">
              <div className="text-8xl mb-12 sm:mb-16">🏷️</div>
              <h3 className="text-4xl font-extrabold text-white mb-8 sm:mb-10 tracking-tight">
                {searchQuery ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="text-gray-400 text-xl font-normal mb-16 sm:mb-20 max-w-md mx-auto tracking-normal">
                {searchQuery 
                  ? `No tags match "${searchQuery}"`
                  : 'Tags will appear here as questions are created with tags.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/questions?tag=${encodeURIComponent(tag.name)}`}
                  className="bg-slate-800/80 border-2 border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-slate-700/50 text-cyan-300 px-3 py-1.5 rounded-lg text-sm font-medium group-hover:bg-cyan-500/20 transition-colors">
                      {tag.name}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      {tag.count} {tag.count === 1 ? 'question' : 'questions'}
                    </span>
                  </div>
                  {tag.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">
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

