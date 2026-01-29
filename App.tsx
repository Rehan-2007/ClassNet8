
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Search, Send, Paperclip, Smile, Star, Download, Trash2, 
  Plus, Filter, CheckCircle2, ChevronRight, TrendingUp, Award, Zap,
  Settings, LogOut, Mic, MicOff, Star as StarFilled, MessageCircle,
  BrainCircuit, Lightbulb, FileText, Video, Image as ImageIcon,
  Calendar, CheckCircle, Sparkles, Quote, Hash, BookOpen, Trophy, 
  Users, ShieldCheck, User as UserIcon, Save, Users as UsersGroup, 
  Share2, Link as LinkIcon, Heart, MessageSquare, Camera, MoreVertical,
  Bell, Palette, Globe, Lock, Layers, Activity, Server, Eye, Ban,
  Megaphone, BarChart3, Edit, ClipboardList, ArrowUpRight
} from 'lucide-react';
import { User, ChatMessage, Task, Quiz, Mentor, CollaborativeNote, Post, PulseItem, Announcement, SystemStats } from './types';
import { MENU_ITEMS, MOCK_POSTS, MOCK_TASKS, MOCK_QUIZZES, MOCK_NOTES, MOCK_PULSE, MOCK_MENTORS } from './constants';
import { fetchDailyFunFact } from './services/geminiService';

// --- Global Sync Channels ---
const syncChannel = new BroadcastChannel('classnet_sync');
const sessionId = Math.random().toString(36).substring(7);

// --- Shared Components ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-xl rounded-[2rem] md:rounded-[2.5rem] border-glass shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="px-6 py-5 md:px-8 md:py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40">
          <h3 className="font-black text-white uppercase tracking-widest text-xs">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto scrollbar-none">{children}</div>
      </div>
    </div>
  );
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- View Components ---

const Onboarding: React.FC<{ onJoin: (name: string, email: string, role: 'student' | 'instructor') => void }> = ({ onJoin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');

  return (
    <div className="fixed inset-0 bg-obsidian z-[200] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="max-w-md w-full space-y-10 text-center relative z-10">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl ring-1 ring-white/10">
            <span className="text-white text-4xl font-black italic tracking-tighter">CN</span>
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">ClassNet</h1>
          <p className="text-slate-400 text-lg font-medium">Neural Learning Environment</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Identity Handle..."
            className="block w-full px-6 py-4 rounded-2xl bg-slate-900/50 border border-white/5 focus:border-indigo-500/50 transition-all text-white placeholder-slate-600 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Universal Email..."
            className="block w-full px-6 py-4 rounded-2xl bg-slate-900/50 border border-white/5 focus:border-indigo-500/50 transition-all text-white placeholder-slate-600 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
             <button onClick={() => setRole('student')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === 'student' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Student</button>
             <button onClick={() => setRole('instructor')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${role === 'instructor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Instructor</button>
          </div>
          <button
            onClick={() => name && email && onJoin(name, email, role)}
            disabled={!name || !email}
            className="w-full py-4 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-xl"
          >
            Access Mainframe
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'content' | 'system'>('overview');
  const [activeContentTab, setActiveContentTab] = useState<'tasks' | 'quizzes' | 'notes' | 'pulse' | 'feed'>('tasks');
  const [stats, setStats] = useState<SystemStats>({ totalUsers: 1420, activeNow: 86, aiRequests: 12402, systemHealth: 99.8 });
  
  // Dynamic Content States
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('classnet_tasks') || JSON.stringify(MOCK_TASKS)));
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => JSON.parse(localStorage.getItem('classnet_quizzes') || JSON.stringify(MOCK_QUIZZES)));
  const [notes, setNotes] = useState<CollaborativeNote[]>(() => JSON.parse(localStorage.getItem('classnet_notes') || JSON.stringify(MOCK_NOTES)));
  const [pulseItems, setPulseItems] = useState<PulseItem[]>(() => JSON.parse(localStorage.getItem('classnet_pulse') || JSON.stringify(MOCK_PULSE)));
  const [posts, setPosts] = useState<Post[]>(() => JSON.parse(localStorage.getItem('classnet_posts') || JSON.stringify(MOCK_POSTS)));
  const [usersList, setUsersList] = useState<User[]>(() => JSON.parse(localStorage.getItem('classnet_all_users') || '[]'));

  useEffect(() => {
    localStorage.setItem('classnet_tasks', JSON.stringify(tasks));
    localStorage.setItem('classnet_quizzes', JSON.stringify(quizzes));
    localStorage.setItem('classnet_notes', JSON.stringify(notes));
    localStorage.setItem('classnet_pulse', JSON.stringify(pulseItems));
    localStorage.setItem('classnet_posts', JSON.stringify(posts));
    syncChannel.postMessage({ type: 'GLOBAL_CONTENT_REFRESH' });
  }, [tasks, quizzes, notes, pulseItems, posts]);

  const deleteItem = (type: string, id: string) => {
    if (confirm('Deploy deletion protocol? This cannot be undone.')) {
      if (type === 'tasks') setTasks(prev => prev.filter(i => i.id !== id));
      if (type === 'quizzes') setQuizzes(prev => prev.filter(i => i.id !== id));
      if (type === 'notes') setNotes(prev => prev.filter(i => i.id !== id));
      if (type === 'pulse') setPulseItems(prev => prev.filter(i => i.id !== id));
      if (type === 'feed') setPosts(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Command Center</h1>
          <p className="text-slate-500 font-medium hidden sm:block">Privileged Node: {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 p-1.5 bg-slate-900 rounded-2xl border-glass">
          {['overview', 'users', 'content', 'system'].map(s => (
            <button key={s} onClick={() => setActiveSection(s as any)} className={`flex-1 md:flex-none px-4 md:px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeSection === s ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>{s}</button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-in fade-in duration-500">
           {[
             { label: 'Total Nodes', val: stats.totalUsers, icon: <UsersGroup />, col: 'indigo' },
             { label: 'Active Links', val: stats.activeNow, icon: <Activity />, col: 'emerald' },
             { label: 'Neural Flux', val: stats.aiRequests, icon: <BrainCircuit />, col: 'purple' },
             { label: 'Integrity', val: stats.systemHealth + '%', icon: <Server />, col: 'rose' }
           ].map((stat, i) => (
             <div key={i} className="bg-surface p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-glass space-y-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 bg-${stat.col}-600/10 text-${stat.col}-500 rounded-2xl flex items-center justify-center`}>{stat.icon}</div>
                <div><p className="text-2xl md:text-3xl font-black text-white">{stat.val}</p><p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{stat.label}</p></div>
             </div>
           ))}
        </div>
      )}

      {activeSection === 'content' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
           <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
              {['tasks', 'quizzes', 'notes', 'pulse', 'feed'].map(t => (
                <button key={t} onClick={() => setActiveContentTab(t as any)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeContentTab === t ? 'bg-indigo-600/10 text-indigo-500 border border-indigo-500/30' : 'text-slate-500 hover:text-white'}`}>{t}</button>
              ))}
           </div>

           <div className="bg-surface rounded-[2.5rem] md:rounded-[3.5rem] border-glass overflow-hidden shadow-2xl">
              <div className="p-8 md:p-10 flex items-center justify-between border-b border-white/5">
                 <h3 className="text-xl font-black text-white capitalize">{activeContentTab} Registry</h3>
                 <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform"><Plus size={18} /></button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-900/40 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                       <tr><th className="p-6 md:p-8">Identification</th><th className="p-6 md:p-8">Details</th><th className="p-6 md:p-8 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {activeContentTab === 'tasks' && tasks.map(t => (
                         <tr key={t.id} className="hover:bg-slate-900/20"><td className="p-6 md:p-8 font-bold text-white">{t.title}</td><td className="p-6 md:p-8 text-slate-400 text-xs">{t.subject} • {t.dueDate}</td><td className="p-6 md:p-8 text-right"><div className="flex justify-end gap-2"><button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit size={16} /></button><button onClick={() => deleteItem('tasks', t.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button></div></td></tr>
                       ))}
                       {activeContentTab === 'quizzes' && quizzes.map(q => (
                         <tr key={q.id} className="hover:bg-slate-900/20"><td className="p-6 md:p-8 font-bold text-white">{q.title}</td><td className="p-6 md:p-8 text-slate-400 text-xs">{q.subject} • {q.difficulty}</td><td className="p-6 md:p-8 text-right"><div className="flex justify-end gap-2"><button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit size={16} /></button><button onClick={() => deleteItem('quizzes', q.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button></div></td></tr>
                       ))}
                       {activeContentTab === 'notes' && notes.map(n => (
                         <tr key={n.id} className="hover:bg-slate-900/20"><td className="p-6 md:p-8 font-bold text-white">{n.emoji} {n.title}</td><td className="p-6 md:p-8 text-slate-400 text-xs">Edited by {n.lastEditedBy}</td><td className="p-6 md:p-8 text-right"><div className="flex justify-end gap-2"><button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit size={16} /></button><button onClick={() => deleteItem('notes', n.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button></div></td></tr>
                       ))}
                       {activeContentTab === 'pulse' && pulseItems.map(p => (
                         <tr key={p.id} className="hover:bg-slate-900/20"><td className="p-6 md:p-8 font-bold text-white truncate max-w-xs">{p.title}</td><td className="p-6 md:p-8 text-slate-400 text-xs truncate max-w-xs">{p.content}</td><td className="p-6 md:p-8 text-right"><div className="flex justify-end gap-2"><button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit size={16} /></button><button onClick={() => deleteItem('pulse', p.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button></div></td></tr>
                       ))}
                       {activeContentTab === 'feed' && posts.map(f => (
                         <tr key={f.id} className="hover:bg-slate-900/20"><td className="p-6 md:p-8 font-bold text-white truncate max-w-xs">{f.content}</td><td className="p-6 md:p-8 text-slate-400 text-xs">by {f.userName}</td><td className="p-6 md:p-8 text-right"><div className="flex justify-end gap-2"><button className="p-2 text-indigo-400 hover:bg-indigo-400/10 rounded-lg"><Edit size={16} /></button><button onClick={() => deleteItem('feed', f.id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg"><Trash2 size={16} /></button></div></td></tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="bg-surface rounded-[2.5rem] md:rounded-[3.5rem] border-glass overflow-hidden animate-in fade-in duration-500">
           <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 gap-4">
             <h3 className="text-xl font-black text-white">Neural Directory</h3>
             <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} /><input placeholder="Neural filter..." className="w-full md:w-auto bg-slate-900 border-glass rounded-2xl py-3 pl-12 pr-6 text-white text-sm outline-none focus:border-indigo-500" /></div>
           </div>
           <div className="overflow-x-auto"><table className="w-full text-left font-medium text-sm">
             <thead className="bg-slate-900/20 text-[10px] font-black text-slate-600 uppercase tracking-widest"><tr><th className="p-8">Node</th><th className="p-8">Tier</th><th className="p-8 text-right">Action</th></tr></thead>
             <tbody className="divide-y divide-white/5">
               {usersList.map(u => (
                 <tr key={u.id} className="hover:bg-white/[0.02] transition-colors"><td className="p-8 flex items-center gap-4"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white">{u.name.charAt(0)}</div><div><p className="font-bold text-white">{u.name}</p><p className="text-[10px] text-slate-600 uppercase">{u.email}</p></div></td><td className="p-8"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${u.role === 'instructor' ? 'bg-purple-600/10 text-purple-500' : 'bg-indigo-600/10 text-indigo-500'}`}>{u.role}</span></td><td className="p-8 text-right"><button className="p-3 bg-slate-900 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Ban size={18} /></button></td></tr>
               ))}
             </tbody>
           </table></div>
        </div>
      )}
    </div>
  );
};

// --- App Components ---

const FeedView: React.FC<{ user: User }> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>(() => JSON.parse(localStorage.getItem('classnet_posts') || JSON.stringify(MOCK_POSTS)));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleSync = () => setPosts(JSON.parse(localStorage.getItem('classnet_posts') || '[]'));
    syncChannel.addEventListener('message', (e) => e.data.type === 'GLOBAL_CONTENT_REFRESH' && handleSync());
    return () => syncChannel.removeEventListener('message', handleSync);
  }, []);

  const createPost = async () => {
    if (!content.trim() && !media) return;
    const post: Post = { id: Date.now().toString(), userId: user.id, userName: user.name, userAvatar: user.name.charAt(0), content, mediaUrl: media || undefined, likes: 0, comments: [], timestamp: 'Just now' };
    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('classnet_posts', JSON.stringify(updated));
    syncChannel.postMessage({ type: 'GLOBAL_CONTENT_REFRESH' });
    setContent(''); setMedia(null); setIsModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-12 space-y-12 px-4">
      <button onClick={() => setIsModalOpen(true)} className="w-full bg-surface p-6 rounded-[2rem] border-glass flex items-center gap-4 text-slate-500 hover:border-indigo-500/50 transition-all group shadow-xl">
        <div className="w-10 h-10 bg-indigo-600/10 text-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><ImageIcon size={20} /></div>
        <span className="font-bold text-sm md:text-base text-left">Broadcasting from node {user.name}...</span>
      </button>

      <div className="space-y-12 md:space-y-16">
        {posts.map(post => (
          <article key={post.id} className="bg-surface rounded-[2.5rem] md:rounded-[3rem] border-glass overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-white text-lg">{post.userAvatar}</div>
                <div><h4 className="font-black text-white text-sm md:text-base">{post.userName}</h4><p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{post.timestamp}</p></div>
              </div>
              <MoreVertical size={20} className="text-slate-600 cursor-pointer" />
            </div>
            {post.mediaUrl && <img src={post.mediaUrl} className="w-full aspect-square object-cover" />}
            <div className="p-8 md:p-10 space-y-6">
              <div className="flex items-center gap-8">
                <button className="flex items-center gap-3 text-rose-500 hover:scale-110 transition-transform"><Heart size={26} /><span className="font-black text-lg">{post.likes}</span></button>
                <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors"><MessageSquare size={26} /><span className="font-black text-lg">{post.comments.length}</span></button>
              </div>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed"><span className="font-black text-white mr-3">{post.userName}</span>{post.content}</p>
            </div>
          </article>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Signal Deployment">
        <div className="space-y-6">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Synthesis content..." className="w-full bg-slate-900 border-glass rounded-2xl p-5 text-white outline-none focus:border-indigo-500 h-40 md:h-48 resize-none text-base" />
          {media && <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900"><img src={media} className="w-full h-full object-cover" /><button onClick={() => setMedia(null)} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full"><X size={16} /></button></div>}
          <div className="flex gap-4">
             <button onClick={() => fileRef.current?.click()} className="flex-1 py-4 bg-slate-900 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest border-glass hover:text-white transition-all flex items-center justify-center gap-2"><Camera size={20} /> Attach Scan</button>
             <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (file) setMedia(await fileToBase64(file)); }} />
          </div>
          <button onClick={createPost} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Execute Signal</button>
        </div>
      </Modal>
    </div>
  );
};

const TaskTrackerView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('classnet_tasks') || JSON.stringify(MOCK_TASKS)));
  useEffect(() => {
    const h = () => setTasks(JSON.parse(localStorage.getItem('classnet_tasks') || '[]'));
    syncChannel.addEventListener('message', (e) => e.data.type === 'GLOBAL_CONTENT_REFRESH' && h());
    return () => syncChannel.removeEventListener('message', h);
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12 px-4">
      <div className="space-y-2"><h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">My Desk</h1><p className="text-slate-500 text-sm md:text-base font-medium">Mission-critical schedule management.</p></div>
      <div className="grid gap-6">
        {tasks.map(t => (
          <div key={t.id} className="bg-surface p-6 md:p-8 rounded-3xl border-glass flex items-center justify-between group shadow-lg">
            <div className="flex items-center gap-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${t.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-800 text-slate-800 group-hover:border-indigo-500'}`}><CheckCircle size={24} /></div>
              <div><h4 className={`font-bold text-base md:text-xl ${t.status === 'completed' ? 'text-slate-600 line-through' : 'text-white'}`}>{t.title}</h4><p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1">{t.subject} • Target: {t.dueDate}</p></div>
            </div>
            {/* Fix: Added missing ArrowUpRight import at top of file */}
            <ArrowUpRight className="text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
        {tasks.length === 0 && <div className="p-20 text-center opacity-10"><ClipboardList size={80} className="mx-auto" /><p className="font-black mt-6 uppercase tracking-widest">No Missions Logged</p></div>}
      </div>
    </div>
  );
};

const QuizView: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => JSON.parse(localStorage.getItem('classnet_quizzes') || JSON.stringify(MOCK_QUIZZES)));
  useEffect(() => {
    const h = () => setQuizzes(JSON.parse(localStorage.getItem('classnet_quizzes') || '[]'));
    syncChannel.addEventListener('message', (e) => e.data.type === 'GLOBAL_CONTENT_REFRESH' && h());
    return () => syncChannel.removeEventListener('message', h);
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-12 px-4">
       <div className="space-y-2"><h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">Knowledge Garden</h1><p className="text-slate-500 font-medium text-sm md:text-base">Neural challenges for high-tier nodes.</p></div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
         {quizzes.map(q => (
           <div key={q.id} className="bg-surface p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border-glass space-y-8 group hover:border-indigo-500/30 transition-all shadow-xl">
             <div className="w-14 h-14 bg-indigo-600/10 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Trophy size={28} /></div>
             <div><h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight">{q.title}</h3><p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2">{q.subject} • {q.difficulty}</p></div>
             <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">Begin Sequence</button>
           </div>
         ))}
       </div>
    </div>
  );
};

const PulseView: React.FC = () => {
  const [pulse, setPulse] = useState<PulseItem[]>(() => JSON.parse(localStorage.getItem('classnet_pulse') || JSON.stringify(MOCK_PULSE)));
  useEffect(() => {
    const h = () => setPulse(JSON.parse(localStorage.getItem('classnet_pulse') || '[]'));
    syncChannel.addEventListener('message', (e) => e.data.type === 'GLOBAL_CONTENT_REFRESH' && h());
    return () => syncChannel.removeEventListener('message', h);
  }, []);

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto space-y-12 px-4">
      <div className="space-y-2"><h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">The Pulse</h1><p className="text-slate-500 font-medium text-sm md:text-base">Live neural insights from the ClassNet global link.</p></div>
      <div className="space-y-8">
        {pulse.map(p => (
          <div key={p.id} className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] border-glass relative overflow-hidden group shadow-2xl">
            <BrainCircuit size={100} className="absolute -top-4 -right-4 opacity-5 group-hover:scale-125 transition-transform duration-[2s]" />
            <div className="space-y-6 relative z-10">
               <div className="flex items-center gap-4 text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]"><Sparkles size={20} /> Neural Transmission</div>
               <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">{p.title}</h3>
               <p className="text-lg md:text-xl text-slate-300 font-medium italic leading-relaxed">"{p.content}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkspaceView: React.FC<{ user: User }> = ({ user }) => {
  const [notes, setNotes] = useState<CollaborativeNote[]>(() => JSON.parse(localStorage.getItem('classnet_notes') || JSON.stringify(MOCK_NOTES)));
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const activeNote = notes.find(n => n.id === activeNoteId);

  useEffect(() => {
    const h = () => setNotes(JSON.parse(localStorage.getItem('classnet_notes') || '[]'));
    syncChannel.addEventListener('message', (e) => e.data.type === 'GLOBAL_CONTENT_REFRESH' && h());
    return () => syncChannel.removeEventListener('message', h);
  }, []);

  const updateNote = (id: string, update: Partial<CollaborativeNote>) => {
    const updated = notes.map(n => n.id === id ? { ...n, ...update, lastEditedBy: user.name, lastEditedAt: new Date().toISOString() } : n);
    setNotes(updated);
    localStorage.setItem('classnet_notes', JSON.stringify(updated));
    syncChannel.postMessage({ type: 'GLOBAL_CONTENT_REFRESH' });
  };

  const createNote = () => {
    const newNote: CollaborativeNote = { id: Date.now().toString(), title: 'New Synthesis', emoji: '📝', content: '', lastEditedBy: user.name, lastEditedAt: new Date().toISOString(), collaborators: [user.name] };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('classnet_notes', JSON.stringify(updated));
    setActiveNoteId(newNote.id);
    syncChannel.postMessage({ type: 'GLOBAL_CONTENT_REFRESH' });
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] overflow-hidden">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 bg-obsidian p-6 md:p-8 flex flex-col space-y-6 shrink-0 h-40 md:h-auto overflow-y-auto">
        <button onClick={createNote} className="w-full py-3 md:py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3"><Plus size={18} /> New Synthesis</button>
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto scrollbar-none pb-2 md:pb-0">
          {notes.map(n => (
            <button key={n.id} onClick={() => setActiveNoteId(n.id)} className={`shrink-0 md:shrink-1 w-48 md:w-full p-4 md:p-5 text-left rounded-2xl transition-all border ${activeNoteId === n.id ? 'bg-slate-900 border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-slate-900/40'}`}>
              <div className="flex items-center gap-3"><span className="text-xl">{n.emoji}</span><h4 className="font-black text-sm text-white truncate">{n.title}</h4></div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 bg-obsidian p-6 md:p-16 overflow-y-auto">
        {activeNote ? (
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="flex items-center gap-4 md:gap-6"><span className="text-4xl md:text-6xl">{activeNote.emoji}</span><input value={activeNote.title} onChange={(e) => updateNote(activeNote.id, { title: e.target.value })} className="text-3xl md:text-5xl font-black text-white bg-transparent border-none focus:ring-0 w-full p-0 tracking-tighter" /></div>
            <textarea value={activeNote.content} onChange={(e) => updateNote(activeNote.id, { content: e.target.value })} placeholder="Execute intel capture..." className="w-full bg-transparent border-none focus:ring-0 text-base md:text-xl text-slate-300 leading-relaxed font-medium min-h-[400px] md:min-h-[500px] resize-none p-0 scrollbar-none" />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10"><Layers size={100} /><p className="font-black uppercase tracking-[0.4em] mt-6">Awaiting Link</p></div>
        )}
      </div>
    </div>
  );
};

// --- Profile/Messenger (Simple Refines) ---

const MessengerView: React.FC<{ user: User }> = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const chats = [{ id: 'gen', name: 'Global Network Feed', avatar: 'GC', status: 'Active' }, { id: 'u2', name: 'David Kim', avatar: 'DK', status: 'Online' }];

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] overflow-hidden">
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-white/5 bg-obsidian shrink-0 flex-col`}>
        <div className="p-8 border-b border-white/5"><h2 className="text-xl font-black text-white">Neural Threads</h2></div>
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <button key={chat.id} onClick={() => setSelectedChat(chat.id)} className={`w-full p-8 flex items-center gap-5 border-b border-white/5 transition-all ${selectedChat === chat.id ? 'bg-slate-900 border-l-4 border-indigo-600' : 'hover:bg-slate-900/30'}`}>
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-indigo-400 shrink-0">{chat.avatar}</div>
              <div className="flex-1 text-left"><h4 className="font-black text-white">{chat.name}</h4><p className="text-[10px] font-black text-slate-700 uppercase">{chat.status}</p></div>
            </button>
          ))}
        </div>
      </div>
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-obsidian`}>
        {selectedChat ? (
           <div className="flex-1 flex flex-col">
              <div className="h-20 md:h-24 border-b border-white/5 px-6 md:px-10 flex items-center justify-between">
                 <button onClick={() => setSelectedChat(null)} className="md:hidden p-3 text-slate-500"><X /></button>
                 <h3 className="font-black text-white text-lg">Transmission Active</h3>
                 <div className="w-10 h-10 bg-indigo-600/10 text-indigo-500 rounded-xl flex items-center justify-center"><Lock size={18} /></div>
              </div>
              <div className="flex-1 flex items-center justify-center opacity-10 font-black uppercase tracking-widest text-xs">Waiting for Neural Response...</div>
           </div>
        ) : (
          <div className="flex-1 flex items-center justify-center opacity-10"><MessageCircle size={100} /></div>
        )}
      </div>
    </div>
  );
};

const ProfileView: React.FC<{ user: User; setUser: (u: User) => void }> = ({ user, setUser }) => {
  const [formData, setFormData] = useState(user);
  const [isSaved, setIsSaved] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  const save = () => { setUser(formData); localStorage.setItem('classnet_user', JSON.stringify(formData)); setIsSaved(true); setTimeout(() => setIsSaved(false), 2000); };

  return (
    <div className="max-w-4xl mx-auto py-10 md:py-16 px-6 md:px-8 space-y-12 md:space-y-16">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
        <div className="relative cursor-pointer group" onClick={() => avatarRef.current?.click()}>
          <div className="w-40 h-40 md:w-48 md:h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] md:rounded-[4rem] flex items-center justify-center text-6xl md:text-7xl font-black text-white shadow-2xl relative z-10 overflow-hidden">
             {formData.avatar ? <img src={formData.avatar} className="w-full h-full object-cover" /> : formData.name.charAt(0)}
          </div>
          <button className="absolute -bottom-2 -right-2 bg-white text-black p-4 rounded-2xl shadow-2xl z-20 group-hover:scale-110 transition-transform"><Camera size={20} /></button>
          <input type="file" ref={avatarRef} className="hidden" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setFormData({...formData, avatar: await fileToBase64(f)}); }} />
        </div>
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">{user.name}</h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium italic leading-relaxed">"{user.bio || 'Mission Objective: Excellence.'}"</p>
          <div className="flex justify-center md:justify-start gap-8 md:gap-12">
            <div><p className="text-2xl md:text-3xl font-black text-white">{user.stats.level}</p><p className="text-[10px] font-black text-slate-700 uppercase mt-1">Tier</p></div>
            <div><p className="text-2xl md:text-3xl font-black text-indigo-500">{user.stats.points}</p><p className="text-[10px] font-black text-slate-700 uppercase mt-1">XP</p></div>
            <div><p className="text-2xl md:text-3xl font-black text-rose-500">{user.stats.streak}d</p><p className="text-[10px] font-black text-slate-700 uppercase mt-1">Link</p></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        <div className="bg-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-glass space-y-8">
           <h3 className="text-xl font-black text-white flex items-center gap-4"><Settings size={22} className="text-indigo-500" /> Identity Config</h3>
           <div className="space-y-6">
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border-glass rounded-2xl p-4 md:p-5 text-white outline-none focus:border-indigo-500" placeholder="Handle..." />
              <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-slate-900 border-glass rounded-2xl p-4 md:p-5 text-white outline-none focus:border-indigo-500 h-32 resize-none" placeholder="Bio..." />
              <button onClick={save} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3">{isSaved ? <CheckCircle size={18} /> : <Save size={18} />}{isSaved ? 'Deployed' : 'Update Identity'}</button>
           </div>
        </div>
        <div className="bg-surface p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-glass space-y-8 flex flex-col justify-center items-center text-center">
           <ShieldCheck size={60} className="text-purple-500 opacity-20" />
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Authorized Permissions</p>
           <p className="text-xl font-black text-white">{user.isAdmin ? 'Ultimate Override' : 'Standard Node Access'}</p>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('classnet_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleJoin = (name: string, email: string, role: 'student' | 'instructor') => {
    const isAdmin = email.toLowerCase() === 'techbyrehan123@gmail.com';
    const newUser: User = { id: isAdmin ? 'admin-0' : Date.now().toString(), name, email, role: isAdmin ? 'admin' : role, isAdmin, stats: { points: 150, streak: 1, level: 1 }, settings: { isIncognito: false, notificationsEnabled: true, theme: 'dark' } };
    setUser(newUser);
    localStorage.setItem('classnet_user', JSON.stringify(newUser));
  };

  if (!user) return <Onboarding onJoin={handleJoin} />;

  const renderContent = () => {
    if (activeTab === 'admin' && user.isAdmin) return <AdminDashboard user={user} />;
    switch (activeTab) {
      case 'feed': return <FeedView user={user} />;
      case 'chat': return <MessengerView user={user} />;
      case 'notes': return <WorkspaceView user={user} />;
      case 'tasks': return <TaskTrackerView />;
      case 'quizzes': return <QuizView />;
      case 'mentors': return <div className="p-20 text-center opacity-10"><Users size={100} className="mx-auto" /><p className="font-black mt-8 text-xl uppercase tracking-widest">Network Directory Encrypted</p></div>;
      case 'fun': return <PulseView />;
      case 'profile': return <ProfileView user={user} setUser={setUser} />;
      default: return <FeedView user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-obsidian overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Responsive Sidebar Overlay */}
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden" />}

      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-obsidian border-r border-white/5 z-[100] transform transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-20 md:h-24 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center font-black italic text-white text-xl shadow-lg">CN</div>
              <span className="text-xl font-black text-white tracking-tighter">ClassNet</span>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500"><X size={24} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-2">
          {MENU_ITEMS.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}`}>
              <span className={activeTab === item.id ? 'text-white' : 'text-slate-600'}>{item.icon}</span>
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
            </button>
          ))}
          {user.isAdmin && (
            <button onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all mt-8 border border-indigo-500/20 ${activeTab === 'admin' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-purple-600/20' : 'text-indigo-400 hover:bg-indigo-600/10'}`}>
              <ShieldCheck size={20} />
              <span className="font-black text-[10px] uppercase tracking-[0.2em]">Command Center</span>
            </button>
          )}
        </nav>
        <div className="p-8 hidden md:block">
           <div className="bg-slate-900/50 p-6 rounded-3xl border-glass flex items-center gap-5">
              <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center"><Zap size={22} /></div>
              <div><p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Link Streak</p><p className="text-lg font-black text-white">{user.stats.streak} Days</p></div>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 md:h-24 border-b border-white/5 px-6 md:px-10 flex items-center justify-between bg-obsidian/80 backdrop-blur-xl sticky top-0 z-40">
           <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 text-slate-400 bg-slate-900 rounded-xl hover:text-white transition-colors"><Menu size={24} /></button>
           <h2 className="hidden md:block text-[9px] font-black text-slate-800 uppercase tracking-[0.6em]">Secure Neural Protocol Active</h2>
           <div className="flex items-center gap-4 md:gap-6">
             <button className="p-3 text-slate-500 hover:text-white relative transition-colors"><Bell size={24} /><div className="absolute top-3.5 right-3.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-obsidian" /></button>
             <button onClick={() => setActiveTab('profile')} className="flex items-center gap-4 bg-slate-900/40 p-1.5 md:pr-6 rounded-2xl border-glass hover:border-indigo-500/50 transition-all">
                <div className="w-10 h-10 md:w-11 md:h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg overflow-hidden">{user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}</div>
                <div className="text-left hidden lg:block"><p className="font-black text-white text-xs">{user.name}</p><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{user.role}</p></div>
             </button>
           </div>
        </header>
        <main className="flex-1 overflow-y-auto scrollbar-none bg-[#0B0E14]">{renderContent()}</main>
      </div>
    </div>
  );
}
