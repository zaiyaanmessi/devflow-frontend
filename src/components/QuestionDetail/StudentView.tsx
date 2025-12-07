// components/QuestionDetail/StudentView.tsx

import Link from 'next/link';
import React from 'react';

interface StudentViewProps {
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
      {/* Question Section */}
      <div className="question-section-container">
        <div className="question-section-content">
          {/* Left: Vote Column */}
          <div className="vote-column">
            <button
              onClick={() => onVoteQuestion(1)}
              className={`vote-button-up ${questionVote === 1 ? 'active' : ''}`}
            >
              <svg className="vote-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <div className="vote-count-display">{question.votes || 0}</div>
            <button
              onClick={() => onVoteQuestion(-1)}
              className={`vote-button-down ${questionVote === -1 ? 'active' : ''}`}
            >
              <svg className="vote-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Right: Question Content */}
          <div className="question-content-wrapper">
            {/* Question Title */}
            <h1 className="question-title-large">
              {question.title}
            </h1>

            {/* Question Meta */}
            <div className="question-meta-info">
              <span>Asked</span>
              <span>{new Date(question.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <Link
                href={`/profile/${question.asker._id}`}
                className="question-meta-link"
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
                    className="question-meta-action question-meta-action-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDeleteQuestion}
                    className="question-meta-action question-meta-action-delete"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>

            {/* Question Body */}
            <div 
              className="question-body-content"
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
            <div className="question-tags-container">
              {question.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="question-tag-item"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Question Comments */}
            <div className="comments-container">
              <h3 className="comments-title">Comments</h3>
              <div className="comments-list">
                {questionComments.map((comment: any) => (
                  <div key={comment._id} className="comment-item-card">
                    <div className="comment-item-content">
                      <Link
                        href={`/profile/${comment.author._id}`}
                        className="comment-author-link"
                      >
                        {comment.author.username}
                      </Link>
                      <span>•</span>
                      <span className="comment-body-text">{comment.body}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Question Comment Form */}
              {currentUserId ? (
                <form onSubmit={onAddQuestionComment} className="comment-form">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="comment-input-field"
                  />
                  <button
                    type="submit"
                    className="comment-submit-button"
                  >
                    Add comment
                  </button>
                </form>
              ) : (
                <div className="comment-login-prompt">
                  <Link href="/login" className="comment-login-link">
                    Sign in
                  </Link>
                  {' '}to comment on this question
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="answers-section-container">
        <h2 className="answers-section-title">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>

        {answers.length === 0 ? (
          <div className="answers-empty-state">
            No answers yet. Be the first to answer!
          </div>
        ) : (
          <div className="answers-list">
            {answers.map((answer: any) => (
              <div
                key={answer._id}
                className={`answer-card ${answer.isAccepted ? 'accepted' : ''}`}
              >
                {/* Left: Vote Column */}
                <div className="vote-column">
                  <button
                    onClick={() => onVoteAnswer(answer._id, 1)}
                    className={`vote-button-up ${answerVotes[answer._id] === 1 ? 'active' : ''}`}
                  >
                    <svg className="vote-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <div className="vote-count-display">{answer.votes || 0}</div>
                  <button
                    onClick={() => onVoteAnswer(answer._id, -1)}
                    className={`vote-button-down ${answerVotes[answer._id] === -1 ? 'active' : ''}`}
                  >
                    <svg className="vote-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {answer.isAccepted && (
                    <div className="accepted-indicator">
                      <div className="accepted-icon-circle">
                        <svg className="accepted-icon-svg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="accepted-label">Accepted</span>
                    </div>
                  )}
                </div>

                {/* Right: Answer Content */}
                <div className="answer-content-wrapper">
                  {/* Accepted Answer Badge */}
                  {answer.isAccepted && (
                    <div className="accepted-badge-large">
                      <svg className="accepted-badge-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <span className="accepted-badge-text">Accepted Answer</span>
                        <p className="accepted-badge-description">This answer has been marked as the solution to the question</p>
                      </div>
                    </div>
                  )}
                  {editingAnswerId === answer._id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        onSaveAnswer(answer._id);
                      }}
                      className="edit-answer-form"
                    >
                      <textarea
                        value={editingAnswerText}
                        onChange={(e) => setEditingAnswerText(e.target.value)}
                        className="edit-answer-textarea"
                        required
                      />
                      <div className="edit-answer-buttons">
                        <button
                          type="submit"
                          disabled={isSavingAnswer}
                          className="edit-answer-save"
                        >
                          {isSavingAnswer ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAnswerText('')}
                          className="edit-answer-cancel"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* Answer Meta */}
                      <div className="answer-meta-info">
                        <span>Answered</span>
                        <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <Link
                          href={`/profile/${answer.answerer._id}`}
                          className="question-meta-link"
                        >
                          {answer.answerer.username}
                        </Link>
                        {isQuestionAsker && !answer.isAccepted && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => onAcceptAnswer(answer._id)}
                              className="answer-meta-action answer-meta-action-accept"
                            >
                              Accept
                            </button>
                          </>
                        )}
                        {/* EDIT/DELETE BUTTONS FOR ANSWER AUTHOR */}
                        {currentUserId === answer.answerer._id && (
                          <>
                            <span>•</span>
                            <button
                              onClick={() => onEditAnswer(answer._id, answer.body)}
                              className="question-meta-action question-meta-action-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteAnswer(answer._id)}
                              className="question-meta-action question-meta-action-delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                      {/* Answer Body */}
                      <div 
                        className="answer-body-content"
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
                      <div className="comments-container">
                        <h3 className="comments-title">Comments</h3>
                        <div className="comments-list">
                          {(answerComments[answer._id] || []).map((comment: any) => (
                            <div key={comment._id} className="comment-item-card">
                              <div className="comment-item-content">
                                <Link
                                  href={`/profile/${comment.author._id}`}
                                  className="comment-author-link"
                                >
                                  {comment.author.username}
                                </Link>
                                <span>•</span>
                                <span className="comment-body-text">{comment.body}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Answer Comment Form */}
                        {currentUserId ? (
                          <form
                            onSubmit={(e) => onAddAnswerComment(answer._id, e)}
                            className="comment-form"
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
                              className="comment-input-field"
                            />
                            <button
                              type="submit"
                              className="comment-submit-button"
                            >
                              Add comment
                            </button>
                          </form>
                        ) : (
                          <div className="comment-login-prompt">
                            <Link href="/login" className="comment-login-link">
                              Sign in
                            </Link>
                            {' '}to comment on this answer
                          </div>
                        )}
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
