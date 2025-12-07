import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
import Sidebar from '@/components/Sidebar';
import StudentView from '@/components/QuestionDetail/StudentView';
import ExpertView from '@/components/QuestionDetail/ExpertView';
import AdminView from '@/components/QuestionDetail/AdminView';

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [questionComments, setQuestionComments] = useState<any[]>([]);
  const [answerComments, setAnswerComments] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isQuestionAsker, setIsQuestionAsker] = useState(false);
  
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editQuestionData, setEditQuestionData] = useState({ title: '', body: '', tags: '' });
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  
  const [editingAnswerId, setEditingAnswerId] = useState<string | null>(null);
  const [editingAnswerText, setEditingAnswerText] = useState('');
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  
  const [answerText, setAnswerText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [answerCommentText, setAnswerCommentText] = useState<{ [key: string]: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  
  const [questionVote, setQuestionVote] = useState<1 | -1 | 0>(0);
  const [answerVotes, setAnswerVotes] = useState<{ [key: string]: 1 | -1 | 0 }>({});

  useEffect(() => {
    if (!id) return;
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUserId(user._id);
          setCurrentUserRole(user.role);
        } catch (err) {
          console.error('Failed to parse user data:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (question && currentUserId) {
      setIsQuestionAsker(question.asker._id === currentUserId);
    }
  }, [question, currentUserId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data);
      setAnswers(response.data.answers || []);
      setQuestionComments(response.data.comments || []);
      
      const answerCommentsMap: { [key: string]: any[] } = {};
      response.data.answers?.forEach((ans: any) => {
        answerCommentsMap[ans._id] = ans.comments || [];
      });
      setAnswerComments(answerCommentsMap);
      setError('');
    } catch (err: any) {
      console.error('Error fetching question:', err);
      setError(err.response?.data?.error || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) {
      setError('Answer cannot be empty');
      return;
    }
    setSubmitLoading(true);
    setError('');
    try {
      const response = await api.post(`/questions/${id}/answers`, { body: answerText });
      setAnswers([...answers, response.data]);
      setAnswerText('');
      await fetchQuestion();
    } catch (err: any) {
      console.error('Error creating answer:', err);
      setError(err.response?.data?.error || 'Failed to post answer');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleAddQuestionComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const response = await api.post('/comments', {
        body: commentText,
        targetType: 'question',
        targetId: question._id,
      });
      setQuestionComments([...questionComments, response.data]);
      setCommentText('');
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handleAddAnswerComment = async (answerId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = answerCommentText[answerId];
    if (!text?.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    try {
      const response = await api.post('/comments', {
        body: text,
        targetType: 'answer',
        targetId: answerId,
      });
      setAnswerComments({
        ...answerComments,
        [answerId]: [...(answerComments[answerId] || []), response.data]
      });
      setAnswerCommentText({ ...answerCommentText, [answerId]: '' });
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId: string, targetType: 'question' | 'answer') => {
    try {
      await api.delete(`/comments/${commentId}`);
      if (targetType === 'question') {
        setQuestionComments(questionComments.filter(c => c._id !== commentId));
      } else {
        const newAnswerComments = { ...answerComments };
        Object.keys(newAnswerComments).forEach(answerId => {
          newAnswerComments[answerId] = newAnswerComments[answerId].filter(c => c._id !== commentId);
        });
        setAnswerComments(newAnswerComments);
      }
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  const handleVoteQuestion = async (value: 1 | -1) => {
    if (!question) return;
    try {
      const response = await api.post('/votes', {
        targetType: 'question',
        targetId: question._id,
        value,
      });
      setQuestionVote(questionVote === value ? 0 : value);
      setQuestion({ ...question, votes: response.data.votes });
    } catch (err: any) {
      console.error('Error voting on question:', err);
      setError(err.response?.data?.error || 'Failed to vote');
    }
  };

  const handleVoteAnswer = async (answerId: string, value: 1 | -1) => {
    try {
      const response = await api.post('/votes', {
        targetType: 'answer',
        targetId: answerId,
        value,
      });
      setAnswerVotes({
        ...answerVotes,
        [answerId]: answerVotes[answerId] === value ? 0 : value
      });
      setAnswers(
        answers.map((ans) =>
          ans._id === answerId ? { ...ans, votes: response.data.votes } : ans
        )
      );
    } catch (err: any) {
      console.error('Error voting on answer:', err);
      setError(err.response?.data?.error || 'Failed to vote');
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await api.put(`/questions/${id}/answers/${answerId}/accept`, {});
      setAnswers(
        answers.map((ans) =>
          ans._id === answerId
            ? { ...ans, isAccepted: true }
            : { ...ans, isAccepted: false }
        )
      );
      setQuestion({ ...question, acceptedAnswer: answerId });
    } catch (err: any) {
      console.error('Error accepting answer:', err);
      setError(err.response?.data?.error || 'Failed to accept answer');
    }
  };

  const handleEditQuestion = () => {
    if (!question) return;
    if (!isQuestionAsker && currentUserRole !== 'admin') {
      setError('You can only edit your own questions');
      return;
    }
    setEditQuestionData({
      title: question.title,
      body: question.body,
      tags: question.tags?.join(', ') || ''
    });
    setIsEditingQuestion(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editQuestionData.title.trim() || !editQuestionData.body.trim()) {
      setError('Title and body are required');
      return;
    }
    setIsSavingQuestion(true);
    setError('');
    try {
      const tags = editQuestionData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      const response = await api.put(`/questions/${id}`, {
        title: editQuestionData.title,
        body: editQuestionData.body,
        tags
      });
      setQuestion(response.data);
      setIsEditingQuestion(false);
    } catch (err: any) {
      console.error('Error updating question:', err);
      setError(err.response?.data?.error || 'Failed to update question');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      setError('');
      const response = await api.delete(`/questions/${id}`);
      console.log('Question deleted successfully:', response.data);
      
      setTimeout(() => {
        router.push('/questions');
      }, 300);
      
    } catch (err: any) {
      console.error('Error deleting question:', err);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      setError(err.response?.data?.error || 'Failed to delete question');
    }
  };

  const handleEditAnswer = (answerId: string, answerBody: string) => {
    setEditingAnswerId(answerId);
    setEditingAnswerText(answerBody);
  };

  const handleSaveAnswer = async (answerId: string) => {
    if (!editingAnswerText.trim()) {
      setError('Answer cannot be empty');
      return;
    }
    setIsSavingAnswer(true);
    setError('');
    try {
      await api.put(`/questions/${id}/answers/${answerId}`, {
        body: editingAnswerText
      });
      setAnswers(
        answers.map((ans) =>
          ans._id === answerId ? { ...ans, body: editingAnswerText } : ans
        )
      );
      setEditingAnswerId(null);
      setEditingAnswerText('');
    } catch (err: any) {
      console.error('Error updating answer:', err);
      setError(err.response?.data?.error || 'Failed to update answer');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;
    try {
      await api.delete(`/questions/${id}/answers/${answerId}`);
      setAnswers(answers.filter((ans) => ans._id !== answerId));
    } catch (err: any) {
      console.error('Error deleting answer:', err);
      setError(err.response?.data?.error || 'Failed to delete answer');
    }
  };

  const handleDeleteAnyAnswer = async (answerId: string) => {
    if (!confirm('Are you sure you want to delete this answer? (Admin action)')) return;
    try {
      await api.delete(`/questions/${id}/answers/${answerId}`);
      setAnswers(answers.filter((ans) => ans._id !== answerId));
    } catch (err: any) {
      console.error('Error deleting answer:', err);
      setError(err.response?.data?.error || 'Failed to delete answer');
    }
  };

  const handleLockQuestion = async () => {
    try {
      // TODO: Implement lock question API call
      setError('Lock question feature not yet implemented');
    } catch (err: any) {
      console.error('Error locking question:', err);
      setError(err.response?.data?.error || 'Failed to lock question');
    }
  };

  const handlePinQuestion = async () => {
    try {
      // TODO: Implement pin question API call
      setError('Pin question feature not yet implemented');
    } catch (err: any) {
      console.error('Error pinning question:', err);
      setError(err.response?.data?.error || 'Failed to pin question');
    }
  };

  const handleVerifyAnswer = async (answerId: string) => {
    try {
      // TODO: Implement verify answer API call
      setError('Verify answer feature not yet implemented');
    } catch (err: any) {
      console.error('Error verifying answer:', err);
      setError(err.response?.data?.error || 'Failed to verify answer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-slate-400">Loading question...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-slate-400">Question not found</div>
          <Link href="/questions" className="text-cyan-400 font-semibold hover:text-cyan-300 mt-4 inline-block">
            ← Back to Questions
          </Link>
        </div>
      </div>
    );
  }

  const commonProps = {
    question,
    answers,
    questionComments,
    answerComments,
    isQuestionAsker,
    currentUserId,
    questionVote,
    answerVotes,
    onVoteQuestion: handleVoteQuestion,
    onVoteAnswer: handleVoteAnswer,
    onAcceptAnswer: handleAcceptAnswer,
    onEditQuestion: handleEditQuestion,
    onDeleteQuestion: handleDeleteQuestion,
    onEditAnswer: handleEditAnswer,
    onDeleteAnswer: handleDeleteAnswer,
    onAddQuestionComment: handleAddQuestionComment,
    onAddAnswerComment: handleAddAnswerComment,
    onDeleteComment: handleDeleteComment,
    commentText,
    setCommentText,
    answerCommentText,
    setAnswerCommentText,
    editingAnswerId,
    editingAnswerText,
    setEditingAnswerText,
    onSaveAnswer: handleSaveAnswer,
    isSavingAnswer,
  };

  return (
      <div className="min-h-screen bg-slate-900">
      <Sidebar />
      <main className="main-with-sidebar !pl-[20rem] lg:!pl-[22rem] xl:!pl-[24rem]">
        <div className="max-w-[1400px] mx-auto px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-12 sm:py-16 md:py-20">
        {error && (
          <div className="bg-red-500/15 border-l-4 border-red-400 text-red-300 p-5 rounded-r-xl mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isEditingQuestion ? (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl shadow-lg shadow-black/20 p-10 sm:p-12 md:p-16 mb-12">
            <form onSubmit={handleSaveQuestion}>
              <h2 className="text-2xl font-bold text-white mb-6">Edit Question</h2>
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={editQuestionData.title}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  required
                />
                <textarea
                  value={editQuestionData.body}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, body: e.target.value })}
                  className="w-full h-48 px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                  required
                />
                <input
                  type="text"
                  value={editQuestionData.tags}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, tags: e.target.value })}
                  placeholder="e.g., javascript, react"
                  className="w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isSavingQuestion ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingQuestion(false)}
                  className="bg-slate-700 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-600 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl shadow-lg shadow-black/20 p-10 sm:p-12 md:p-16 mb-16">
            {currentUserRole === 'admin' && <AdminView {...commonProps} currentUserId={currentUserId} onDeleteAnyAnswer={handleDeleteAnyAnswer} onLockQuestion={handleLockQuestion} onPinQuestion={handlePinQuestion} />}
            {currentUserRole === 'expert' && <ExpertView {...commonProps} currentUserId={currentUserId} onVerifyAnswer={handleVerifyAnswer} />}
            {(!currentUserRole || currentUserRole === 'user') && <StudentView {...commonProps} currentUserId={currentUserId} />}
          </div>
        )}

        <div className="bg-slate-800/80 border-2 border-slate-700 rounded-xl shadow-lg shadow-black/20 p-10 sm:p-12 md:p-16 mt-16">
          <h3 className="text-2xl font-semibold text-white mb-3">Your Answer</h3>
          <p className="text-sm text-slate-400 mb-6">Share your knowledge and help others solve this problem</p>
          <form onSubmit={handleAddAnswer}>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer here... Be detailed and helpful!"
              className="w-full h-48 px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-4 transition-all"
              required
            />
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 font-semibold transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {submitLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                'Post Answer'
              )}
            </button>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
}