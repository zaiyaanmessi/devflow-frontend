import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Question, Answer, Comment } from '@/types';

export default function QuestionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [answerText, setAnswerText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // TODO: Replace with actual API call
    // const fetchQuestion = async () => {
    //   const response = await questionAPI.getById(id as string);
    //   setQuestion(response.data);
    //   setAnswers(response.data.answers);
    // };
    // fetchQuestion();

    // MOCK DATA FOR NOW
    setQuestion({
      _id: id as string,
      title: 'How to use React hooks?',
      body: 'I am trying to use useState but it is not working properly in my component. Can someone explain how to use it correctly?',
      asker: {
        _id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        reputation: 100,
        role: 'user',
      },
      tags: ['react', 'javascript'],
      votes: 12,
      views: 250,
      answers: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setAnswers([
      {
        _id: 'ans1',
        questionId: id as string,
        body: 'Use the useState hook like this: const [count, setCount] = useState(0);',
        answerer: {
          _id: '2',
          username: 'jane_doe',
          email: 'jane@example.com',
          reputation: 200,
          role: 'user',
        },
        votes: 25,
        isAccepted: true,
        createdAt: new Date().toISOString(),
      },
    ]);

    setLoading(false);
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!question) return <div className="text-center py-8">Question not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Question */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{question.title}</h1>
              <div className="flex gap-2 mb-4">
                {question.tags.map((tag) => (
                  <span key={tag} className="bg-blue-100 text-blue-900 px-3 py-1 rounded text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Asked by{' '}
                <Link href={`/profile/${question.asker._id}`} className="text-blue-900 font-semibold">
                  {question.asker.username}
                </Link>
                {' '}• {new Date(question.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{question.votes}</div>
              <div className="text-sm text-gray-600">votes</div>
            </div>
          </div>

          <div className="prose max-w-none mb-6 text-gray-700">
            {question.body}
          </div>

          {/* Vote Buttons */}
          <div className="flex gap-4">
            <button className="bg-blue-100 text-blue-900 px-4 py-2 rounded hover:bg-blue-200 font-semibold">
              👍 Upvote
            </button>
            <button className="bg-red-100 text-red-900 px-4 py-2 rounded hover:bg-red-200 font-semibold">
              👎 Downvote
            </button>
          </div>
        </div>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{answers.length} Answers</h2>
          <div className="space-y-4">
            {answers.map((answer) => (
              <div key={answer._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-semibold text-green-600 mb-2">✓ Accepted Answer</p>
                    <Link
                      href={`/profile/${answer.answerer._id}`}
                      className="text-blue-900 font-semibold hover:text-blue-700"
                    >
                      {answer.answerer.username}
                    </Link>
                    <span className="text-gray-600 text-sm ml-2">⭐ {answer.answerer.reputation}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{answer.votes}</div>
                    <div className="text-sm text-gray-600">votes</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{answer.body}</p>

                <div className="flex gap-2">
                  <button className="bg-blue-100 text-blue-900 px-3 py-1 rounded text-sm hover:bg-blue-200">
                    👍 Upvote
                  </button>
                  <button className="bg-red-100 text-red-900 px-3 py-1 rounded text-sm hover:bg-red-200">
                    👎 Downvote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Answer Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Answer</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // TODO: Connect to backend
              console.log('Add answer:', answerText);
            }}
          >
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Write your answer here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 font-semibold"
            >
              Post Answer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}