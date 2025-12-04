import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';
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
      await api.delete(`/questions/${id}`);
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting question:', err);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto text-center py-8">
          <div className="text-lg text-gray-600">Question not found</div>
          <Link href="/" className="text-blue-900 font-semibold hover:text-blue-700 mt-4 inline-block">
            ← Back to Home
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-6 border border-red-300">
            {error}
          </div>
        )}

        {isEditingQuestion ? (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <form onSubmit={handleSaveQuestion}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Question</h2>
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={editQuestionData.title}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  value={editQuestionData.body}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, body: e.target.value })}
                  className="w-full h-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  value={editQuestionData.tags}
                  onChange={(e) => setEditQuestionData({ ...editQuestionData, tags: e.target.value })}
                  placeholder="e.g., javascript, react"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSavingQuestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400"
                >
                  {isSavingQuestion ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingQuestion(false)}
                  className="bg-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            {currentUserRole === 'admin' && <AdminView {...commonProps} onDeleteAnyAnswer={handleDeleteAnyAnswer} />}
            {currentUserRole === 'expert' && <ExpertView {...commonProps} />}
            {(!currentUserRole || currentUserRole === 'user') && <StudentView {...commonProps} />}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleAddAnswer}>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 font-semibold transition-colors disabled:bg-gray-400"
            >
              {submitLoading ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}