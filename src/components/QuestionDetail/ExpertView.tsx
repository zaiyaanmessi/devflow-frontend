// components/QuestionDetail/ExpertView.tsx

import Link from 'next/link';
import React from 'react';

interface ExpertViewProps {
  question: any;
  answers: any[];
  questionComments: any[];
  answerComments: any;
  isQuestionAsker: boolean;
  currentUserId: string | null;
  questionVote: 1 | -1 | 0;
  answerVotes: { [key: string]: 1 | -1 | 0 };
  
  // Handlers
  onVoteQuestion: (value: 1 | -1) => void;
  onVoteAnswer: (answerId: string, value: 1 | -1) => void;
  onAcceptAnswer: (answerId: string) => void;
  onEditQuestion: () => void;
  onDeleteQuestion: () => void;
  onEditAnswer: (answerId: string, body: string) => void;
  onDeleteAnswer: (answerId: string) => void;
  onAddQuestionComment: (e: React.FormEvent) => void;
  onAddAnswerComment: (answerId: string, e: React.FormEvent) => void;
  onDeleteComment: (commentId: string, targetType: 'question' | 'answer') => void;
  onVerifyAnswer: (answerId: string) => void;
  
  // State
  commentText: string;
  setCommentText: (text: string) => void;
  answerCommentText: { [key: string]: string };
  setAnswerCommentText: (text: { [key: string]: string }) => void;
  editingAnswerId: string | null;
  editingAnswerText: string;
  setEditingAnswerText: (text: string) => void;
  onSaveAnswer: (answerId: string) => Promise<void>;
  isSavingAnswer: boolean;
}

export default function ExpertView({
  question,
  answers,
  questionComments,
  answerComments,
  isQuestionAsker,
  currentUserId,
  questionVote,
  answerVotes,
  onVoteQuestion,
  onVoteAnswer,
  onAcceptAnswer,
  onEditQuestion,
  onDeleteQuestion,
  onEditAnswer,
  onDeleteAnswer,
  onAddQuestionComment,
  onAddAnswerComment,
  onDeleteComment,
  onVerifyAnswer,
  commentText,
  setCommentText,
  answerCommentText,
  setAnswerCommentText,
  editingAnswerId,
  editingAnswerText,
  setEditingAnswerText,
  onSaveAnswer,
  isSavingAnswer
}: ExpertViewProps) {
  return (
    <>
      {/* Question Header */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{question.title}</h1>
          
          {/* Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {question.tags?.map((tag: string) => (
              <span key={tag} className="bg-blue-100 text-blue-900 px-3 py-1 rounded text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
          
          {/* Question Meta Info */}
          <div className="text-sm text-gray-600">
            Asked by{' '}
            <Link
              href={`/profile/${question.asker._id}`}
              className="text-blue-900 font-semibold hover:text-blue-700"
            >
              {question.asker.username}
            </Link>
            {' '}• {new Date(question.createdAt).toLocaleDateString()}
            {' '}• {question.views} views
          </div>
        </div>

        {/* Vote Count & Expert Badge */}
        <div className="text-right">
          <div className="inline-block bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            👨‍🏫 Expert View
          </div>
          <div className="text-2xl font-bold text-gray-900">{question.votes || 0}</div>
          <div className="text-sm text-gray-600">votes</div>
          
          {/* Edit/Delete for Question Asker */}
          {isQuestionAsker && (
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={onEditQuestion}
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={onDeleteQuestion}
                className="text-red-600 hover:text-red-800 font-semibold text-sm"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Question Body */}
      <div className="prose max-w-none mb-6 text-gray-700 whitespace-pre-wrap">
        {question.body}
      </div>

      {/* Vote Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => onVoteQuestion(1)}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            questionVote === 1
              ? 'bg-blue-500 text-white'
              : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
          }`}
        >
          👍 Upvote
        </button>
        <button
          onClick={() => onVoteQuestion(-1)}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            questionVote === -1
              ? 'bg-red-500 text-white'
              : 'bg-red-100 text-red-900 hover:bg-red-200'
          }`}
        >
          👎 Downvote
        </button>
      </div>

      {/* Question Comments */}
      <div className="border-t pt-6 mt-6">
        <h4 className="font-semibold text-gray-900 mb-3">
          Comments ({questionComments.length})
        </h4>
        
        {/* Comments List */}
        <div className="space-y-3 mb-4">
          {questionComments.map((comment: any) => (
            <div
              key={comment._id}
              className="bg-gray-50 p-3 rounded border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <Link
                    href={`/profile/${comment.author._id}`}
                    className="text-blue-900 font-semibold text-sm hover:text-blue-700"
                  >
                    {comment.author.username}
                  </Link>
                  <p className="text-gray-700 text-sm mt-1">{comment.body}</p>
                </div>
                <button
                  onClick={() => onDeleteComment(comment._id, 'question')}
                  className="text-red-600 hover:text-red-800 text-xs font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={onAddQuestionComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-purple-700"
          >
            Comment
          </button>
        </form>
      </div>

      {/* Answers Section */}
      <div className="mt-12 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
            No answers yet. Be the first to answer!
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer: any) => {
              const isExpertAnswer = answer.answerer.role === 'expert';
              return (
                <div
                  key={answer._id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    answer.isAccepted
                      ? 'border-green-500'
                      : isExpertAnswer
                      ? 'border-purple-500'
                      : 'border-gray-300'
                  }`}
                >
                  {editingAnswerId === answer._id ? (
                    // Edit Mode
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSaveAnswer(answer._id);
                      }}
                    >
                      <textarea
                        value={editingAnswerText}
                        onChange={(e) => setEditingAnswerText(e.target.value)}
                        className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSavingAnswer}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400"
                        >
                          {isSavingAnswer ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAnswerText('')}
                          className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <>
                      {/* Answer Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          {answer.isAccepted && (
                            <p className="text-sm font-semibold text-green-600 mb-2">
                              ✓ Accepted Answer
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${answer.answerer._id}`}
                              className="text-blue-900 font-semibold hover:text-blue-700"
                            >
                              {answer.answerer.username}
                            </Link>
                            {isExpertAnswer && (
                              <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-xs font-semibold">
                                👨‍🏫 Expert
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600 text-sm ml-2">
                            ⭐ {answer.answerer.reputation}
                          </span>
                        </div>

                        {/* Vote Count */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {answer.votes || 0}
                          </div>
                          <div className="text-sm text-gray-600">votes</div>
                        </div>
                      </div>

                      {/* Answer Body */}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{answer.body}</p>

                      {/* Answer Actions */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                          onClick={() => onVoteAnswer(answer._id, 1)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            answerVotes[answer._id] === 1
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-100 text-blue-900 hover:bg-blue-200'
                          }`}
                        >
                          👍 Upvote
                        </button>
                        <button
                          onClick={() => onVoteAnswer(answer._id, -1)}
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                            answerVotes[answer._id] === -1
                              ? 'bg-red-500 text-white'
                              : 'bg-red-100 text-red-900 hover:bg-red-200'
                          }`}
                        >
                          👎 Downvote
                        </button>

                        {/* Verify Answer Button (Expert Can Verify) */}
                        {currentUserId !== answer.answerer._id && (
                          <button
                            onClick={() => onVerifyAnswer(answer._id)}
                            className="px-3 py-1 rounded text-sm font-semibold bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors ml-auto"
                          >
                            ✓ Verify
                          </button>
                        )}

                        {/* Accept Answer Button (Only for Question Asker) */}
                        {isQuestionAsker && !answer.isAccepted && (
                          <button
                            onClick={() => onAcceptAnswer(answer._id)}
                            className="px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-900 hover:bg-green-200 transition-colors"
                          >
                            ✓ Accept
                          </button>
                        )}
                      </div>
                    </>
                  )}

                  {/* Answer Comments */}
                  <div className="border-t pt-4 mt-4">
                    <h5 className="font-semibold text-gray-900 mb-3 text-sm">
                      Comments ({(answerComments[answer._id] || []).length})
                    </h5>

                    {/* Comments List */}
                    <div className="space-y-2 mb-3">
                      {(answerComments[answer._id] || []).map((comment: any) => (
                        <div
                          key={comment._id}
                          className="bg-gray-50 p-2 rounded border border-gray-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <Link
                                href={`/profile/${comment.author._id}`}
                                className="text-blue-900 font-semibold text-xs hover:text-blue-700"
                              >
                                {comment.author.username}
                              </Link>
                              <p className="text-gray-700 text-xs mt-1">{comment.body}</p>
                            </div>
                            <button
                              onClick={() => onDeleteComment(comment._id, 'answer')}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment Form */}
                    <form
                      onSubmit={(e) => onAddAnswerComment(answer._id, e)}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={answerCommentText[answer._id] || ''}
                        onChange={(e) =>
                          setAnswerCommentText({
                            ...answerCommentText,
                            [answer._id]: e.target.value
                          })
                        }
                        placeholder="Add a comment..."
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="bg-purple-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-purple-600"
                      >
                        Comment
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}