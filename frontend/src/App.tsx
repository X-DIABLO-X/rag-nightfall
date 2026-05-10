import { useState, useRef, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { uploadPDF, sendMessage, deleteSession } from './lib/api';
import type { Message, UploadResponse } from './types';
import PDFUpload from './components/PDFUpload';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import StatusBar from './components/StatusBar';

interface Session {
  id: string;
  fileName: string;
  pageCount: number;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      let latest: UploadResponse | null = null;
      for (const file of files) {
        latest = await uploadPDF(file);
      }
      if (!latest) return;

      setSession({ id: latest.sessionId, fileName: latest.fileName, pageCount: latest.pageCount });
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: files.length === 1
          ? `I've read "${latest.fileName}" (${latest.pageCount} pages). What would you like to know?`
          : `I've read ${files.length} PDFs. Active document: "${latest.fileName}" (${latest.pageCount} pages). What would you like to know?`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSend = useCallback(async (question: string) => {
    if (!session || isLoading) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: question, timestamp: new Date() },
    ]);
    setIsLoading(true);
    try {
      const result = await sendMessage(session.id, question);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.answer,
          citations: result.citations,
          isOutOfScope: result.isOutOfScope,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          isOutOfScope: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading]);

  const handleReset = useCallback(async () => {
    if (session) await deleteSession(session.id).catch(() => {});
    setSession(null);
    setMessages([]);
    setUploadError(null);
  }, [session]);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: 'transparent' }}>
      <aside
        className="w-[272px] shrink-0 flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(8,17,31,0.96) 0%, rgba(5,12,22,0.98) 100%)',
          boxShadow: '18px 0 48px rgba(0,0,0,0.28)',
          borderRight: '1px solid rgba(140,170,210,0.12)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="px-5 py-4 flex items-center gap-3 shrink-0"
          style={{ borderBottom: '1px solid rgba(140,170,210,0.12)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
              boxShadow: '0 8px 24px rgba(45, 212, 191, 0.28)',
            }}
          >
            <BookOpen className="w-4 h-4 text-slate-950" strokeWidth={2.2} />
          </div>
          <div className="leading-tight">
            <h1 className="text-[13px] font-semibold tracking-tight" style={{ color: '#edf4ff' }}>
              RAG Nightfall
            </h1>
            <p className="text-[11px] mt-0.5" style={{ color: '#7dd3fc' }}>
              Dark document intelligence
            </p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto scrollbar-panel">
          <PDFUpload
            sessionInfo={session ? { fileName: session.fileName, pageCount: session.pageCount } : null}
            isUploading={isUploading}
            uploadError={uploadError}
            onUpload={handleUpload}
            onReset={handleReset}
          />
        </div>

        <div
          className="px-4 py-3 shrink-0"
          style={{ borderTop: '1px solid rgba(140,170,210,0.08)' }}
        >
          <p className="text-[10px] leading-relaxed" style={{ color: '#667a98' }}>
            Answers stay grounded in your uploaded document, with source traces and scope checks built in.
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          hasSession={!!session}
          messagesEndRef={messagesEndRef}
        />

        {session && (
          <StatusBar fileName={session.fileName} pageCount={session.pageCount} />
        )}

        <div
          className="shrink-0 px-6 py-4"
          style={{
            background: 'linear-gradient(180deg, rgba(8,17,31,0) 0%, rgba(5,11,21,0.94) 45%)',
            borderTop: '1px solid rgba(140,170,210,0.08)',
          }}
        >
          <div className="max-w-2xl mx-auto">
            <ChatInput
              onSend={handleSend}
              isLoading={isLoading}
              disabled={!session}
              placeholder={
                session
                  ? 'Ask about this document... (Enter to send, Shift+Enter for new line)'
                  : 'Upload a PDF to start chatting'
              }
            />
            {!session && (
              <p className="text-center text-xs mt-2" style={{ color: '#667a98' }}>
                All answers come exclusively from your uploaded document
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
