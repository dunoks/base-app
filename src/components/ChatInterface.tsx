import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { chatWithLumina } from '../lib/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Lumina System online. Input query for creative analysis." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: trimmedInput }]);
    setIsLoading(true);

    try {
      const response = await chatWithLumina(messages, trimmedInput);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Operational error: Vector retrieval failed.' }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Critical Error: Creative heuristic interrupted.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 pb-32 scrollbar-hide pt-4"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
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

      <div className="absolute bottom-8 left-0 right-0 px-4 pointer-events-none">
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
  );
}

