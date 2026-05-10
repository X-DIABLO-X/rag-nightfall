import { useState } from 'react';
import { AlertTriangle, ChevronRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../types';
import { cn } from '../lib/utils';
import CitationBlock from './CitationBlock';
import { AiAvatar } from './ChatWindow';

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const hasCitations = !message.isOutOfScope && (message.citations?.length ?? 0) > 0;
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
            boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
          }}
        >
          <span className="text-white text-[8px] font-bold tracking-widest">YOU</span>
        </div>
      ) : (
        <AiAvatar />
      )}

      <div className={cn('max-w-[80%] space-y-1.5', isUser && 'flex flex-col items-end')}>
        {isUser && (
          <div
            className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
              boxShadow: '0 16px 32px rgba(37,99,235,0.2), 0 1px 3px rgba(124,58,237,0.18)',
              color: '#ffffff',
            }}
          >
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          </div>
        )}

        {!isUser && message.isOutOfScope && (
          <div
            className="rounded-xl rounded-tl-sm text-sm leading-relaxed overflow-hidden"
            style={{ background: 'rgba(144,63,63,0.16)', border: '1px solid rgba(245,132,132,0.32)' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold"
              style={{ background: 'rgba(144,63,63,0.24)', borderBottom: '1px solid rgba(245,132,132,0.24)', color: '#ffd1d1' }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Outside document scope
            </div>
            <p className="px-4 py-3.5 whitespace-pre-wrap" style={{ color: '#ffe5e5' }}>
              {message.content}
            </p>
          </div>
        )}

        {!isUser && !message.isOutOfScope && (
          <>
            <div
              className="rounded-xl rounded-tl-sm overflow-hidden"
              style={{
                background: 'rgba(16, 28, 47, 0.94)',
                border: '1px solid rgba(140,170,210,0.18)',
                boxShadow: '0 14px 30px rgba(0,0,0,0.18)',
              }}
            >
              <div className="px-5 py-4">
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#edf4ff', lineHeight: '1.75' }}>
                  {message.content}
                </p>
              </div>

              {hasCitations && (
                <>
                  <div style={{ borderTop: '1px solid rgba(140,170,210,0.12)', margin: '0 20px' }} />
                  <div className="px-5 py-4">
                    <CitationBlock citations={message.citations!} />
                  </div>
                </>
              )}
            </div>

            {hasCitations && (
              <div className="pl-1 space-y-1.5">
                <button
                  onClick={() => setShowWhy((v) => !v)}
                  className="flex items-center gap-1.5 text-xs transition-colors duration-150"
                  style={{ color: showWhy ? '#7dd3fc' : '#667a98' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#7dd3fc';
                  }}
                  onMouseLeave={(e) => {
                    if (!showWhy) e.currentTarget.style.color = '#667a98';
                  }}
                >
                  <ChevronRight
                    className="w-3 h-3 transition-transform duration-150"
                    style={{ transform: showWhy ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                  <Cpu className="w-3 h-3" />
                  Why this answer?
                </button>

                <AnimatePresence>
                  {showWhy && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="rounded-lg px-4 py-3 text-xs space-y-1.5"
                        style={{
                          background: 'rgba(9, 19, 34, 0.96)',
                          border: '1px solid rgba(56,189,248,0.22)',
                          color: '#b8cae4',
                        }}
                      >
                        <div className="font-semibold text-[11px] mb-2" style={{ color: '#7dd3fc' }}>
                          RAG trace
                        </div>
                        <div>
                          Retrieved <span className="font-semibold">{message.citations!.length}</span> passage{message.citations!.length !== 1 ? 's' : ''} from your document
                        </div>
                        <div>
                          Pages referenced:{' '}
                          <span className="font-semibold">
                            {[...new Set(message.citations!.map((c) => c.page))]
                              .sort((a, b) => a - b)
                              .join(', ')}
                          </span>
                        </div>
                        <div
                          className="text-[10px] pt-1.5 mt-0.5"
                          style={{ borderTop: '1px solid rgba(56,189,248,0.16)', color: '#7aa0d4' }}
                        >
                          Answer grounded exclusively in uploaded document - FAISS similarity search
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        <p
          className={cn('text-[10px] font-medium', isUser ? 'text-right' : 'text-left')}
          style={{ color: '#667a98' }}
        >
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
