import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Citation } from '../types';

export default function CitationBlock({ citations }: { citations: Citation[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: '#6ee7c8' }} />
        <span
          className="text-[10px] font-bold uppercase tracking-[0.1em]"
          style={{ color: '#95a7c4' }}
        >
          Sources
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}
        >
          {citations.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {citations.map((citation, i) => (
          <div key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center gap-2.5 text-left group"
            >
              <span
                className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded transition-colors duration-150"
                style={{
                  background: openIdx === i ? '#34d399' : 'rgba(52,211,153,0.12)',
                  color: openIdx === i ? '#04111f' : '#99f6e4',
                }}
              >
                p.{citation.page}
              </span>

              <span
                className="text-xs flex-1 truncate transition-colors duration-150"
                style={{ color: openIdx === i ? '#edf4ff' : '#95a7c4' }}
              >
                {citation.snippet.slice(0, 70)}{citation.snippet.length > 70 ? '...' : ''}
              </span>

              <span
                className="shrink-0 text-[9px] transition-all duration-150"
                style={{
                  color: openIdx === i ? '#6ee7c8' : '#667a98',
                  transform: openIdx === i ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}
              >
                {'>'}
              </span>
            </button>

            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-2 px-3.5 py-2.5 rounded-lg text-xs leading-relaxed italic"
                    style={{
                      background: 'rgba(8, 17, 31, 0.9)',
                      border: '1px solid rgba(56,189,248,0.16)',
                      borderLeft: '3px solid #34d399',
                      color: '#d8e8ff',
                    }}
                  >
                    "{citation.snippet}"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
