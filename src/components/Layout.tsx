import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Plus, Layers, Settings, ChevronRight } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Layout({ children, activeView, setActiveView }: LayoutProps) {
  const menuItems = [
    { id: 'brainstorm', label: 'Dashboard', icon: Sparkles },
    { id: 'chat', label: 'Muse Chat', icon: MessageSquare },
    { id: 'projects', label: 'History', icon: Layers },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-bg-dark text-text-primary selection:bg-accent/30 font-sans">
      {/* Sidebar - aside width 240px as per theme */}
      <aside className="w-[240px] h-full border-r border-border shrink-0 px-6 py-10 flex flex-col bg-surface/50">
        <div className="flex flex-col h-full">
          <div className="logo font-serif text-2xl italic tracking-tight text-accent mb-16">
            Lumina.
          </div>
          
          <button className="w-full py-4 px-4 border border-border bg-surface text-text-primary rounded-sm flex items-center justify-center gap-2 hover:bg-border transition-all mb-12">
            <Plus size={16} className="text-accent" />
            <span className="font-medium text-xs uppercase tracking-[1.5px]">New Concept</span>
          </button>

          <nav>
            <ul className="space-y-6">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`text-[13px] uppercase tracking-[1.5px] cursor-pointer transition-colors ${
                    activeView === item.id 
                      ? 'text-text-primary' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-border">
          <button className="text-[11px] uppercase tracking-[1.5px] text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2">
            <Settings size={14} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col pt-10 px-10 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

