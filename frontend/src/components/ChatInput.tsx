import { useState, useRef, useCallback } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, isLoading, disabled, placeholder }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, isLoading, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const canSend = !!value.trim() && !isLoading && !disabled;

  return (
    <div
      className={cn('flex items-end gap-2.5 transition-all duration-200', disabled && 'opacity-45')}
      style={{
        background: 'rgba(13, 24, 41, 0.96)',
        border: `1.5px solid ${focused && !disabled ? 'rgba(110,231,200,0.62)' : 'rgba(140,170,210,0.18)'}`,
        borderRadius: '12px',
        padding: '10px 12px',
        boxShadow: focused && !disabled
          ? '0 0 0 3px rgba(45,212,191,0.12), 0 12px 30px rgba(0,0,0,0.18)'
          : '0 10px 30px rgba(0,0,0,0.14)',
        transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder ?? 'Ask a question...'}
        rows={1}
        disabled={isLoading || disabled}
        className={cn(
          'flex-1 bg-transparent text-sm leading-relaxed resize-none outline-none min-h-[24px] max-h-[160px]',
          disabled && 'cursor-not-allowed',
        )}
        style={{
          color: '#edf4ff',
          caretColor: '#6ee7c8',
        }}
      />

      <button
        onClick={submit}
        disabled={!canSend}
        className={cn(
          'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150',
          !canSend && 'cursor-not-allowed',
        )}
        style={
          canSend
            ? {
                background: 'linear-gradient(135deg, #34d399 0%, #38bdf8 100%)',
                boxShadow: '0 10px 24px rgba(45,212,191,0.22)',
                color: '#04111f',
              }
            : {
                background: 'rgba(20, 35, 58, 0.92)',
                color: '#5d7393',
              }
        }
        onMouseEnter={(e) => {
          if (canSend) e.currentTarget.style.boxShadow = '0 14px 30px rgba(45,212,191,0.3)';
        }}
        onMouseLeave={(e) => {
          if (canSend) e.currentTarget.style.boxShadow = '0 10px 24px rgba(45,212,191,0.22)';
        }}
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
}
