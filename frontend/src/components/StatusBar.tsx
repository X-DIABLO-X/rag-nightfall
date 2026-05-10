interface StatusBarProps {
  fileName: string;
  pageCount: number;
}

export default function StatusBar({ fileName, pageCount }: StatusBarProps) {
  return (
    <div
      className="shrink-0 h-9 px-6 flex items-center gap-2.5"
      style={{
        background: 'rgba(8, 17, 31, 0.92)',
        borderTop: '1px solid rgba(140,170,210,0.12)',
        borderBottom: '1px solid rgba(140,170,210,0.12)',
      }}
    >
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: '#6ee7c8' }}
      />
      <span className="text-xs" style={{ color: '#95a7c4' }}>
        Answering from
      </span>
      <span className="text-xs font-semibold truncate max-w-xs" style={{ color: '#edf4ff' }}>
        {fileName}
      </span>
      <span
        className="ml-auto shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full"
        style={{ background: 'rgba(56,189,248,0.12)', color: '#7dd3fc' }}
      >
        {pageCount} pp
      </span>
    </div>
  );
}
