import { useState } from 'react';
import { useRouter } from 'next/router';
import { questionAPI } from '@/services/api';

export default function AskQuestion() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tags = formData.tags.split(',').map((tag) => tag.trim());

      // TODO: Uncomment when backend is ready
      // const response = await questionAPI.create(formData.title, formData.body, tags);
      // router.push(`/questions/${response.data._id}`);

      // FOR NOW: Mock
      alert('Question will be posted when backend is ready!');
      console.log('Submit:', formData, tags);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ask a Question</h1>
          <p className="text-gray-600 mb-8">
            Be specific and imagine you're asking a colleague for help.
          </p>

          {error && <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="What's your programming question? Be specific."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 15 characters</p>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Describe your problem here. Include error messages, code snippets, what you've tried..."
                className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., javascript, react, node.js (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : 'Post Your Question'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}