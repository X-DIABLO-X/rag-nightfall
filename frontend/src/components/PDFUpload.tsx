import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2, RotateCcw, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface SessionInfo {
  fileName: string;
  pageCount: number;
}

interface PDFUploadProps {
  sessionInfo: SessionInfo | null;
  isUploading: boolean;
  uploadError: string | null;
  onUpload: (files: File[]) => Promise<void>;
  onReset: () => void;
}

export default function PDFUpload({
  sessionInfo,
  isUploading,
  uploadError,
  onUpload,
  onReset,
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files.filter(Boolean);
      if (selected.length === 0) return;
      setLocalError(null);
      const invalid = selected.find(
        (file) => !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf',
      );
      if (invalid) {
        setLocalError('Please select a PDF file.');
        return;
      }
      const oversized = selected.find((file) => file.size > 50 * 1024 * 1024);
      if (oversized) {
        setLocalError('File must be under 50 MB.');
        return;
      }
      await onUpload(selected);
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) handleFiles(files);
    },
    [handleFiles],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length) handleFiles(files);
      e.target.value = '';
    },
    [handleFiles],
  );

  const error = localError ?? uploadError;

  if (sessionInfo) {
    return (
      <div className="space-y-2.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: '#5fbcd3' }}>
          Active Document
        </p>

        <div
          className="rounded-xl p-3.5 space-y-3"
          style={{
            background: 'rgba(14, 26, 44, 0.92)',
            border: '1px solid rgba(140,170,210,0.16)',
            boxShadow: '0 14px 28px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(56,189,248,0.14)',
                border: '1px solid rgba(56,189,248,0.3)',
              }}
            >
              <FileText className="w-4 h-4" style={{ color: '#7dd3fc' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold truncate leading-snug"
                style={{ color: '#edf4ff' }}
                title={sessionInfo.fileName}
              >
                {sessionInfo.fileName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#95a7c4' }}>
                {sessionInfo.pageCount} pages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded"
              style={{ background: 'rgba(45,212,191,0.15)', color: '#99f6e4' }}
            >
              <CheckCircle2 className="w-3 h-3" />
              Indexed
            </div>
            <div
              className="text-[10px] font-medium px-2 py-1 rounded"
              style={{ background: 'rgba(56,189,248,0.1)', color: '#7dd3fc' }}
            >
              FAISS ready
            </div>
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium rounded-lg px-3 py-2.5 transition-all duration-150"
          style={{
            background: 'rgba(16, 28, 47, 0.9)',
            border: '1px solid rgba(140,170,210,0.16)',
            color: '#95a7c4',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(23, 40, 67, 0.96)';
            e.currentTarget.style.color = '#edf4ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(16, 28, 47, 0.9)';
            e.currentTarget.style.color = '#95a7c4';
          }}
        >
          <RotateCcw className="w-3 h-3" />
          Replace document
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: '#5fbcd3' }}>
        Document
      </p>

      <label
        className={cn(
          'relative flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all duration-200 py-9 px-5 text-center',
          isUploading && 'pointer-events-none opacity-60',
        )}
        style={{
          background: isDragging ? 'rgba(56,189,248,0.11)' : 'rgba(16, 28, 47, 0.65)',
          border: isDragging
            ? '1.5px dashed rgba(110,231,200,0.75)'
            : '1.5px dashed rgba(140,170,210,0.2)',
          transform: isDragging ? 'scale(1.01)' : 'scale(1)',
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={handleChange}
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'rgba(45,212,191,0.16)' }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#99f6e4' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#edf4ff' }}>Processing...</p>
            <p className="text-xs mt-1" style={{ color: '#95a7c4' }}>Extracting and indexing</p>
          </>
        ) : (
          <>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200"
              style={{
                background: isDragging ? 'rgba(45,212,191,0.16)' : 'rgba(56,189,248,0.1)',
              }}
            >
              {isDragging
                ? <FileText className="w-5 h-5" style={{ color: '#99f6e4' }} />
                : <Upload className="w-5 h-5" style={{ color: '#7dd3fc' }} />
              }
            </div>
            <p className="text-sm font-semibold" style={{ color: isDragging ? '#edf4ff' : '#95a7c4' }}>
              {isDragging ? 'Drop to upload' : 'Drop PDF here'}
            </p>
            <p className="text-xs mt-1" style={{ color: '#5fbcd3' }}>
              or click to browse - max 50 MB
            </p>
          </>
        )}
      </label>

      {error && (
        <div
          className="flex items-start gap-2 text-xs px-3 py-2.5 rounded-lg"
          style={{
            background: 'rgba(144,63,63,0.18)',
            border: '1px solid rgba(245,132,132,0.28)',
            color: '#ffcccc',
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
