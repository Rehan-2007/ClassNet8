
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  isAdmin: boolean;
  avatar?: string;
  bio?: string;
  status?: string;
  stats: {
    points: number;
    streak: number;
    level: number;
  };
  settings: {
    isIncognito: boolean;
    notificationsEnabled: boolean;
    theme: 'dark' | 'light';
  };
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  content: string;
  timestamp: string;
  isAnonymous?: boolean;
  type: 'text' | 'image' | 'voice';
}

export interface Channel {
  id: string;
  name: string;
  type: 'general' | 'subject' | 'qa';
  icon: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'link';
  subject: string;
  uploader: string;
  date: string;
  isStarred: boolean;
  size?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  subject: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  questionsCount: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PulseItem {
  id: string;
  title: string;
  content: string;
  category: 'fact' | 'tip' | 'quote';
  timestamp: string;
}

export interface Mentor {
  id: string;
  name: string;
  avatar: string;
  strengths: string[];
  helpCount: number;
  rating: number;
  status: 'online' | 'offline';
}

export interface CollaborativeNote {
  id: string;
  title: string;
  emoji: string;
  content: string;
  lastEditedBy: string;
  lastEditedAt: string;
  collaborators: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  timestamp: string;
  adminId: string;
}

export interface SystemStats {
  totalUsers: number;
  activeNow: number;
  aiRequests: number;
  systemHealth: number;
}
