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
  const [user, setUser] = useState<any>(null);
  
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
      const token = localStorage.getItem('token');
      if (userData && token && userData !== 'undefined' && userData !== 'null') {
        try {
          const userObj = JSON.parse(userData);
          setUser(userObj);
          setCurrentUserId(userObj._id || userObj.id);
          setCurrentUserRole(userObj.role || 'user');
        } catch (err) {
          console.error('Failed to parse user data:', err);
          setUser(null);
        }
      } else {
        setUser(null);
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
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login?redirect=' + router.asPath);
        }, 1500);
        return;
      }
      
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
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login?redirect=' + router.asPath);
        }, 1500);
        return;
      }
      
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
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.push('/login?redirect=' + router.asPath);
        }, 1500);
        return;
      }
      
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
    if (!currentUserId) return;
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
    if (!currentUserId) return;
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

  const handleVerifyAnswer = async (answerId: string) => {
    try {
      setError('Verify answer feature not yet implemented');
    } catch (err: any) {
      console.error('Error verifying answer:', err);
      setError(err.response?.data?.error || 'Failed to verify answer');
    }
  };

  if (loading) {
    return (
      <div className="question-detail-loading">
        <div className="question-detail-loading-content">
          <div className="question-detail-loading-text">Loading question...</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="question-detail-loading">
        <div className="question-detail-loading-content">
          <div className="question-detail-loading-text">Question not found</div>
          <Link href="/questions" className="question-detail-back-link">
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

  const showSidebar = user ? true : false;

  return (
    <div className="question-detail-container">
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? "main-with-sidebar !pl-[20rem] lg:!pl-[22rem] xl:!pl-[24rem]" : "w-full"}>
        <div className="question-detail-main">
          {error && (
            <div className="question-detail-error">
              <p className="question-detail-error-text">{error}</p>
            </div>
          )}

          {isEditingQuestion ? (
            <div className="question-detail-edit-container">
              <form onSubmit={handleSaveQuestion}>
                <h2 className="question-detail-edit-title">Edit Question</h2>
                <div className="question-detail-edit-form">
                  <input
                    type="text"
                    value={editQuestionData.title}
                    onChange={(e) => setEditQuestionData({ ...editQuestionData, title: e.target.value })}
                    className="question-detail-edit-input"
                    placeholder="Question title"
                    required
                  />
                  <textarea
                    value={editQuestionData.body}
                    onChange={(e) => setEditQuestionData({ ...editQuestionData, body: e.target.value })}
                    className="question-detail-edit-textarea"
                    placeholder="Question body"
                    required
                  />
                  <input
                    type="text"
                    value={editQuestionData.tags}
                    onChange={(e) => setEditQuestionData({ ...editQuestionData, tags: e.target.value })}
                    placeholder="e.g., javascript, react"
                    className="question-detail-edit-input"
                  />
                </div>
                <div className="question-detail-edit-buttons">
                  <button
                    type="submit"
                    disabled={isSavingQuestion}
                    className="question-detail-edit-save"
                  >
                    {isSavingQuestion ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingQuestion(false)}
                    className="question-detail-edit-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="question-detail-view-container">
              {currentUserRole === 'admin' && <AdminView {...commonProps} currentUserId={currentUserId} onDeleteAnyAnswer={handleDeleteAnyAnswer} />}
              {currentUserRole === 'expert' && <ExpertView {...commonProps} currentUserId={currentUserId} onVerifyAnswer={handleVerifyAnswer} />}
              {(!currentUserRole || currentUserRole === 'user') && <StudentView {...commonProps} currentUserId={currentUserId} />}
            </div>
          )}

          {currentUserId ? (
            <div className="question-detail-answer-container">
              <h3 className="question-detail-answer-title">Your Answer</h3>
              <p className="question-detail-answer-subtitle">Share your knowledge and help others solve this problem</p>
              <form onSubmit={handleAddAnswer}>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer here... Be detailed and helpful!"
                  className="question-detail-answer-textarea"
                  required
                />
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="question-detail-answer-submit"
                >
                  {submitLoading ? (
                    <>
                      <svg className="question-detail-answer-spinner" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting...
                    </>
                  ) : (
                    'Post Answer'
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="question-detail-login-prompt">
              <div className="question-detail-login-box">
                <h3 className="question-detail-login-title">Want to answer this question?</h3>
                <p className="question-detail-login-text">You must be logged in to post an answer</p>
                <Link 
                  href="/login" 
                  className="question-detail-login-button"
                >
                  Sign in or Create Account
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
