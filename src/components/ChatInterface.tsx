import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, Sparkles, MessageSquare, Plus, PlusCircle, ArrowLeft, User, Bot } from 'lucide-react';
import { chatWithLumina } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { 
  createConversation, 
  addMessageToConversation, 
  subscribeToConversations, 
  subscribeToMessages,
  ChatThread,
  ChatMessage 
} from '../lib/chatService';

export default function ChatInterface() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to threads
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToConversations(user.uid, (threads) => {
      setThreads(threads);
    });
    return unsubscribe;
  }, [user]);

  // Subscribe to messages of active thread
  useEffect(() => {
    if (!activeThreadId) {
      setMessages([{ role: 'model', text: "Lumina System online. Input query for creative analysis.", timestamp: new Date() }]);
      return;
    }
    const unsubscribe = subscribeToMessages(activeThreadId, (msgs) => {
      setMessages(msgs.length > 0 ? msgs : [{ role: 'model', text: "Vector stream initialized.", timestamp: new Date() }]);
    });
    return unsubscribe;
  }, [activeThreadId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !user) return;

    setInput('');
    setIsLoading(true);

    let currentThreadId = activeThreadId;

    try {
      // 1. Create thread if none active
      if (!currentThreadId) {
        currentThreadId = await createConversation(user.uid, trimmedInput) || null;
        setActiveThreadId(currentThreadId);
      }

      if (!currentThreadId) throw new Error('Failed to identify thread');

      // 2. Save user message to Firestore
      await addMessageToConversation(currentThreadId, 'user', trimmedInput);

      // 3. Get AI response
      const response = await chatWithLumina(messages.map(m => ({ role: m.role, text: m.text })), trimmedInput);
      
      // 4. Save AI response to Firestore
      await addMessageToConversation(currentThreadId, 'model', response || 'Operational error.');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    setMessages([{ role: 'model', text: "Lumina System online. Input query for creative analysis.", timestamp: new Date() }]);
  };

  return (
    <div className="h-full flex relative overflow-hidden">
      {/* Thread Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-border bg-surface/30 flex flex-col h-full shrink-0"
          >
            <div className="p-4 border-b border-border">
              <button 
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-border hover:border-accent text-accent text-[11px] uppercase tracking-widest transition-all"
              >
                <Plus size={14} />
                New Stream
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {threads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full text-left p-3 rounded-sm transition-all group ${
                    activeThreadId === thread.id ? 'bg-surface border border-border' : 'hover:bg-surface/50'
                  }`}
                >
                  <div className={`text-[12px] truncate ${activeThreadId === thread.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                    {thread.title}
                  </div>
                  <div className="text-[9px] text-text-secondary/50 mt-1 uppercase tracking-tighter">
                    {thread.lastModifiedAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col relative w-full">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute left-4 top-4 z-20 text-text-secondary hover:text-accent transition-colors hidden md:block"
        >
          <PlusCircle className={`rotate-45 transition-transform ${isSidebarOpen ? 'rotate-0' : 'rotate-45'}`} size={18} />
        </button>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 pb-32 scrollbar-hide pt-16 px-4 md:px-12"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`text-[10px] uppercase tracking-widest ${msg.role === 'user' ? 'text-text-secondary' : 'text-accent'}`}>
                    {msg.role === 'user' ? 'Operator' : 'Lumina Core'}
                  </div>
                </div>
                <div className={`max-w-[85%] px-6 py-4 rounded-sm border ${
                  msg.role === 'model' 
                    ? 'bg-surface border-border text-text-primary' 
                    : 'bg-transparent border-accent/30 text-text-primary'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-[13px]">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-start"
              >
                <div className="text-[10px] uppercase tracking-widest text-accent mb-2">Lumina Core</div>
                <div className="bg-surface border border-border px-6 py-4 rounded-sm">
                  <Loader2 size={14} className="animate-spin text-accent" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-8 left-0 right-0 px-4 md:px-12 pointer-events-none">
          <form 
            onSubmit={handleSend}
            className="max-w-4xl mx-auto flex gap-0 bg-surface border border-border rounded-sm shadow-2xl pointer-events-auto overflow-hidden h-14"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Input vector stream..."
              required
              className="flex-1 px-6 bg-transparent focus:outline-none text-text-primary text-sm placeholder:text-text-secondary/20"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-20 bg-accent text-bg-dark flex items-center justify-center hover:bg-accent/90 transition-all disabled:opacity-20"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


