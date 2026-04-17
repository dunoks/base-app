import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Wand2, ArrowUpRight, Loader2, Plus } from 'lucide-react';
import { generateCreativeIdeas } from '../lib/gemini';

export default function IdeaGenerator() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    setIsGenerating(true);
    try {
      const result = await generateCreativeIdeas(trimmedTopic);
      setIdeas(result || null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto max-w-5xl">
      <header className="mb-10 flex justify-between items-end border-b border-border pb-6">
        <div>
          <h2 className="font-serif font-normal text-3xl leading-tight">System Brainstorm</h2>
          <p className="text-text-secondary text-sm mt-2">Enter a seed topic to explore creative vectors.</p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-text-primary text-sm font-medium uppercase tracking-wider">Active Muse</div>
          <div className="text-accent text-[10px] uppercase tracking-[1px]">Operational Stable</div>
        </div>
      </header>

      <form onSubmit={handleGenerate} className="relative mb-12">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic identification..."
          required
          className="w-full h-14 bg-surface rounded-sm px-6 text-sm border border-border focus:outline-none focus:border-accent/50 transition-all placeholder:text-text-secondary/30"
        />
        <button
          disabled={isGenerating || !topic.trim()}
          className="absolute right-1 top-1 h-12 px-6 bg-accent text-bg-dark rounded-sm flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          Execute
        </button>
      </form>

      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center pt-20"
            >
              <div className="w-10 h-10 rounded-full border border-accent/20 border-t-accent animate-spin mb-4" />
              <p className="text-text-secondary text-[11px] uppercase tracking-widest animate-pulse">Processing vectors...</p>
            </motion.div>
          ) : ideas ? (
            <motion.div
              key="ideas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-6"
            >
              <div className="serif-card">
                <div className="font-serif text-lg mb-6 border-b border-border pb-3 uppercase tracking-wider text-accent">Analysis Output</div>
                <div className="prose prose-invert max-w-none">
                  {ideas.split('\n').map((line, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-text-primary/90 text-[13px]">{line}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface/30 border border-border border-dashed h-40 rounded-sm flex items-center justify-center">
                  <Plus className="text-border" size={24} />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

