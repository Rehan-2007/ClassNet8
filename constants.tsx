
import React from 'react';
import { 
  Home,
  MessageCircle, 
  Layers, 
  CheckCircle, 
  Trophy, 
  Users, 
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { Channel, Task, Quiz, Mentor, CollaborativeNote, Post, PulseItem } from './types';

export const MENU_ITEMS = [
  { id: 'feed', label: 'Feed', icon: <Home size={20} /> },
  { id: 'chat', label: 'Messages', icon: <MessageCircle size={20} /> },
  { id: 'notes', label: 'Workspace', icon: <Layers size={20} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckCircle size={20} /> },
  { id: 'quizzes', label: 'Quizzes', icon: <Trophy size={20} /> },
  { id: 'mentors', label: 'Mentors', icon: <Users size={20} /> },
  { id: 'fun', label: 'Pulse', icon: <Sparkles size={20} /> },
  { id: 'profile', label: 'Me', icon: <UserIcon size={20} /> },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    userName: 'David Kim',
    userAvatar: 'DK',
    content: 'Just finished the Calculus notes for week 4. Check the vault! 📚✨',
    mediaUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
    likes: 24,
    comments: [
      { id: 'c1', userId: 'u1', userName: 'Me', content: 'Lifesaver! Thanks David.', timestamp: '10m ago' }
    ],
    timestamp: '1h ago'
  },
  {
    id: 'p2',
    userId: 'u3',
    userName: 'Elena Rossi',
    userAvatar: 'ER',
    content: 'Library mood today. Who is down for a study session? ☕️',
    mediaUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800',
    likes: 42,
    comments: [],
    timestamp: '4h ago'
  }
];

export const CHANNELS: Channel[] = [
  { id: 'gen', name: 'Global Class', type: 'general', icon: 'Hash' },
  { id: 'qa', name: 'Anonymous Help', type: 'qa', icon: 'HelpCircle' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Submit Physics Lab Report', dueDate: '2024-05-20', status: 'pending', priority: 'high', subject: 'Physics' },
];

export const MOCK_QUIZZES: Quiz[] = [
  { id: 'q1', title: 'Daily Math Challenge', subject: 'Math', questionsCount: 5, timeLimit: 10, difficulty: 'medium' },
];

export const MOCK_PULSE: PulseItem[] = [
  { id: 'pl1', title: 'Neural Fact', content: 'Honey never spoils. Archaeologists have found edible 3,000-year-old honey in Egyptian tombs.', category: 'fact', timestamp: 'Just now' }
];

export const MOCK_MENTORS: Mentor[] = [
  { id: 'm1', name: 'David Kim', avatar: 'DK', strengths: ['Calculus', 'Physics'], helpCount: 42, rating: 4.9, status: 'online' },
];

export const MOCK_NOTES: CollaborativeNote[] = [
  {
    id: 'n1',
    title: 'Final Project Brainstorming',
    emoji: '🚀',
    content: 'Initial thoughts on history presentation...',
    lastEditedBy: 'Elena Rossi',
    lastEditedAt: '2024-05-15T10:30:00Z',
    collaborators: ['Elena Rossi', 'David Kim', 'Me']
  }
];
