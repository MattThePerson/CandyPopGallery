export default function ActivityIndicator() {
  return (
    <div className="group/act relative w-[30px] h-[30px] border border-[var(--border)] rounded-md flex items-center justify-center hover:bg-[var(--bg2)] transition-colors cursor-default">
      <div className="w-2 h-2 rounded-full bg-[var(--ok)]" />

      <div className="absolute top-[calc(100%+6px)] right-0 z-50 opacity-0 pointer-events-none group-hover/act:opacity-100 group-hover/act:pointer-events-auto transition-opacity duration-150">
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg p-2.5 min-w-[200px]">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-h)] mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--ok)] flex-shrink-0" />
            Idle
          </div>
          <p className="text-[11px] text-[var(--text)] leading-relaxed">No background tasks running.</p>
        </div>
      </div>
    </div>
  )
}
