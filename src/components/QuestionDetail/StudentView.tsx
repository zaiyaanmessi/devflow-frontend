// components/QuestionDetail/StudentView.tsx

import Link from 'next/link';
import React from 'react';

interface StudentViewProps {
  question: any;
  answers: any[];
  questionComments: any[];
  answerComments: any;
  isQuestionAsker: boolean;
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

export default function StudentView({
  question,
  answers,
  questionComments,
  answerComments,
  isQuestionAsker,
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
  commentText,
  setCommentText,
  answerCommentText,
  setAnswerCommentText,
  editingAnswerId,
  editingAnswerText,
  setEditingAnswerText,
  onSaveAnswer,
  isSavingAnswer
}: StudentViewProps) {
  return (
    <>
      {/* Question */}
      <div className="flex gap-4 mb-6">
        {/* Left: Vote Column */}
        <div className="flex flex-col items-center gap-2 min-w-[40px]">
          <button
            onClick={() => onVoteQuestion(1)}
            className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
              questionVote === 1
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div className="text-lg font-semibold text-slate-300">{question.votes || 0}</div>
          <button
            onClick={() => onVoteQuestion(-1)}
            className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
              questionVote === -1
                ? 'bg-red-500/20 border-red-500 text-red-400'
                : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Right: Question Content */}
        <div className="flex-1 min-w-0">
          {/* Question Title */}
          <h1 className="text-2xl sm:text-3xl font-normal text-cyan-400 mb-4 leading-snug break-words overflow-wrap-anywhere">
            {question.title}
          </h1>

          {/* Question Meta */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <span>Asked</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <Link
              href={`/profile/${question.asker._id}`}
              className="text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              {question.asker.username}
            </Link>
            <span>•</span>
            <span>{question.views || 0} views</span>
            {isQuestionAsker && (
              <>
                <span>•</span>
                <button
                  onClick={onEditQuestion}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={onDeleteQuestion}
                  className="text-red-400 hover:text-red-300 hover:underline"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Question Body */}
          <div 
            className="text-sm text-slate-300 mb-6 whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: question.body
                .replace(
                  /\[your image\]\((data:image\/[^)]+)\)/g,
                  '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline"><img src="$1" alt="your image" class="max-w-md rounded mt-2 mb-2 cursor-pointer" onclick="window.open(this.src, \'_blank\')" /></a>'
                )
                .replace(
                  /\[([^\]]+)\]\(([^)]+)\)/g,
                  '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline">$1</a>'
                )
            }}
          />

          {/* Tags */}
          <div className="flex gap-2 flex-wrap mb-6">
            {question.tags?.map((tag: string) => (
              <span
                key={tag}
                className="bg-slate-700/50 text-cyan-300 px-2.5 py-1 rounded text-sm font-normal hover:bg-slate-700 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Question Comments */}
          <div className="border-t border-slate-700 pt-4">
            <div className="space-y-2 mb-3">
              {questionComments.map((comment: any) => (
                <div key={comment._id} className="text-sm text-slate-400">
                  <Link
                    href={`/profile/${comment.author._id}`}
                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                  >
                    {comment.author.username}
                  </Link>
                  <span className="mx-2">•</span>
                  <span>{comment.body}</span>
                </div>
              ))}
            </div>
            <form onSubmit={onAddQuestionComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="bg-slate-700 text-slate-300 px-4 py-1.5 rounded text-sm font-medium hover:bg-slate-600 transition-colors"
              >
                Add comment
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No answers yet. Be the first to answer!
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer: any) => (
              <div
                key={answer._id}
                className={`flex gap-4 ${
                  answer.isAccepted ? 'bg-green-500/10 border-l-4 border-green-500' : ''
                }`}
              >
                {/* Left: Vote Column */}
                <div className="flex flex-col items-center gap-2 min-w-[40px]">
                  <button
                    onClick={() => onVoteAnswer(answer._id, 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
                      answerVotes[answer._id] === 1
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <div className="text-lg font-semibold text-slate-300">{answer.votes || 0}</div>
                  <button
                    onClick={() => onVoteAnswer(answer._id, -1)}
                    className={`w-10 h-10 flex items-center justify-center rounded border transition-colors ${
                      answerVotes[answer._id] === -1
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {answer.isAccepted && (
                    <div className="mt-2 text-green-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Right: Answer Content */}
                <div className="flex-1 min-w-0">
                  {editingAnswerId === answer._id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSaveAnswer(answer._id);
                      }}
                    >
                      <textarea
                        value={editingAnswerText}
                        onChange={(e) => setEditingAnswerText(e.target.value)}
                        className="w-full h-40 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSavingAnswer}
                          className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-400 font-medium disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                          {isSavingAnswer ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAnswerText('')}
                          className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-600 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Answer Meta */}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                        <span>Answered</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <Link
                          href={`/profile/${answer.answerer._id}`}
                          className="text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          {answer.answerer.username}
                        </Link>
                        {isQuestionAsker && !answer.isAccepted && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => onAcceptAnswer(answer._id)}
                              className="text-green-400 hover:text-green-300 hover:underline"
                            >
                              Accept
                            </button>
                          </>
                        )}
                      </div>

                      {/* Answer Body */}
                      <div 
                        className="text-base text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: answer.body
                            .replace(
                              /\[your image\]\((data:image\/[^)]+)\)/g,
                              '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline"><img src="$1" alt="your image" class="max-w-md rounded mt-2 mb-2 cursor-pointer" onclick="window.open(this.src, \'_blank\')" /></a>'
                            )
                            .replace(
                              /\[([^\]]+)\]\(([^)]+)\)/g,
                              '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 hover:underline">$1</a>'
                            )
                        }}
                      />

                      {/* Answer Comments */}
                      <div className="border-t border-slate-700 pt-3">
                        <div className="space-y-2 mb-3">
                          {(answerComments[answer._id] || []).map((comment: any) => (
                            <div key={comment._id} className="text-sm text-slate-400">
                              <Link
                                href={`/profile/${comment.author._id}`}
                                className="text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
                              >
                                {comment.author.username}
                              </Link>
                              <span className="mx-2">•</span>
                              <span>{comment.body}</span>
                            </div>
                          ))}
                        </div>
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
                            className="flex-1 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          />
                          <button
                            type="submit"
                            className="bg-slate-700 text-slate-300 px-4 py-1.5 rounded text-sm font-medium hover:bg-slate-600 transition-colors"
                          >
                            Add comment
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
