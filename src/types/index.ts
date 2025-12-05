export interface User {
    _id: string;
    username: string;
    email: string;
    reputation: number;
    role: 'user' | 'admin' | 'expert';
    bio?: string;
    location?: string;
    title?: string;
    createdAt?: string;
  }
  
  export interface Question {
    _id: string;
    title: string;
    body: string;
    asker: User;
    tags: string[];
    votes: number;
    views: number;
    answers: number;
    acceptedAnswer?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Answer {
    _id: string;
    questionId: string;
    body: string;
    answerer: User;
    votes: number;
    isAccepted: boolean;
    createdAt: string;
  }
  
  export interface Vote {
    _id: string;
    user: string;
    targetType: 'question' | 'answer';
    targetId: string;
    value: 1 | -1;
    createdAt: string;
  }
  
  export interface Comment {
    _id: string;
    body: string;
    author: User;
    targetType: 'question' | 'answer';
    targetId: string;
    createdAt: string;
  }