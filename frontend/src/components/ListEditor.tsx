interface ListEditorProps {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
  reorderable?: boolean
}

export default function ListEditor({
  label,
  items,
  onChange,
  placeholder,
  reorderable = false,
}: ListEditorProps) {
  function update(index: number, value: string) {
    const next = [...items]
    next[index] = value
    onChange(next)
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function move(from: number, to: number) {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  function add() {
    onChange([...items, ''])
  }

  const btnBase =
    'px-2 py-1.5 text-sm rounded border border-[var(--border)] text-[var(--text)] transition-colors'

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--text-h)]">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-1.5">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)]"
          />
          {reorderable && (
            <>
              <button
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                className={`${btnBase} hover:text-[var(--text-h)] hover:border-[var(--text)] disabled:opacity-25 disabled:cursor-not-allowed`}
                title="Move up"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, i + 1)}
                disabled={i === items.length - 1}
                className={`${btnBase} hover:text-[var(--text-h)] hover:border-[var(--text)] disabled:opacity-25 disabled:cursor-not-allowed`}
                title="Move down"
              >
                ↓
              </button>
            </>
          )}
          <button
            onClick={() => remove(i)}
            className={`${btnBase} hover:text-red-500 hover:border-red-400`}
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="self-start px-3 py-1.5 text-sm rounded border border-dashed border-[var(--border)] text-[var(--text)] hover:text-[var(--text-h)] hover:border-[var(--accent)] transition-colors"
      >
        + Add
      </button>
    </div>
  )
}
