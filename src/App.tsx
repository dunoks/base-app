/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import IdeaGenerator from './components/IdeaGenerator';
import ChatInterface from './components/ChatInterface';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('landing');
  
  if (activeView === 'landing') {
    return (
      <div className="h-screen w-full bg-bg-dark flex items-center justify-center p-8 overflow-hidden">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-3 mb-12">
              <div className="logo font-serif text-2xl italic text-accent">
                Lumina.
              </div>
            </div>
            
            <h1 className="text-[clamp(3.5rem,8vw,7rem)] font-serif font-normal tracking-tight leading-[0.9] mb-12 text-text-primary">
              Systematic<br />
              <span className="text-accent italic font-normal">Thought.</span><br />
              Refined.
            </h1>
            
            <p className="text-lg text-text-secondary max-w-sm mb-12 leading-relaxed font-sans">
              A high-precision creative engine designed for the modern operative. Brainstorm, analyze, and refine with Lumina Core.
            </p>

            <button
              onClick={() => setActiveView('brainstorm')}
              className="group h-14 px-10 border border-accent text-accent rounded-sm flex items-center gap-6 text-xs uppercase tracking-[2px] hover:bg-accent hover:text-bg-dark transition-all duration-500"
            >
              Initialize System
              <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={16} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="aspect-[4/5] relative hidden lg:block"
          >
            {/* Thematic frame */}
            <div className="absolute inset-0 border border-border rounded-sm -m-4 z-0" />
            <div className="relative z-10 w-full h-full border border-border rounded-sm overflow-hidden bg-surface shadow-2xl">
               <div className="w-full h-full bg-surface flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-transparent to-transparent z-10" />
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-40 grayscale contrast-125"
                >
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-bright-neon-green-and-orange-swirls-of-paint-42774-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute bottom-10 left-10 z-20">
                  <div className="text-[10px] uppercase tracking-[3px] text-accent mb-2">Protocol 04.2</div>
                  <div className="font-serif text-2xl italic text-text-primary">Lumina Intelligence Core</div>
                </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }


  return (
    <Layout activeView={activeView} setActiveView={setActiveView}>
      <div className="h-full">
        {activeView === 'brainstorm' && <IdeaGenerator />}
        {activeView === 'chat' && <ChatInterface />}
        {activeView === 'projects' && (
          <div className="p-12 h-full flex items-center justify-center text-ink/20 italic">
            Your saved projects will appear here. Coming soon.
          </div>
        )}
      </div>
    </Layout>
  );
}

