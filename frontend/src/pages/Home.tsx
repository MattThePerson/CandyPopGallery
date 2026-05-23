import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto p-7">
      <div className="flex flex-col gap-6 max-w-2xl">

        {/* Config warning — shown when no folders are configured */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px] leading-relaxed"
          style={{
            background: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.30)',
          }}
        >
          <span className="text-base flex-shrink-0 mt-px">⚠</span>
          <p className="text-[var(--text)]">
            No media folders have been configured yet.{' '}
            <Link to="/dashboard/configure" className="text-[var(--accent)] font-medium hover:underline">
              Go to Configure
            </Link>{' '}
            to add your media directories and get started.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <div className="text-[28px] font-bold tracking-tight text-[var(--text-h)] leading-none">
              <span className="text-[var(--accent)]">2,300</span> Posts
            </div>
            <div className="text-[13px] text-[var(--text)]">
              from <span className="text-[var(--text-h)] font-medium">8 platforms</span> and{' '}
              <span className="text-[var(--text-h)] font-medium">69 communities</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { count: '1,840', label: 'images' },
              { count: '312',   label: 'GIFs'   },
              { count: '148',   label: 'videos' },
            ].map(({ count, label }) => (
              <div
                key={label}
                className="px-3 py-1.5 rounded-full text-[12px] border border-[var(--border)] bg-[var(--bg2)] text-[var(--text)]"
              >
                <span className="text-[var(--text-h)] font-medium">{count}</span> {label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
