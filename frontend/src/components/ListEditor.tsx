interface ListEditorProps {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}

export default function ListEditor({
    label,
    items,
    onChange,
    placeholder,
}: ListEditorProps) {
    function update(index: number, value: string) {
        const next = [...items];
        next[index] = value;
        onChange(next);
    }

    function remove(index: number) {
        onChange(items.filter((_, i) => i !== index));
    }

    function add() {
        onChange([...items, ""]);
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-h)]">
                {label}
            </label>
            {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => update(i, e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                    <button
                        onClick={() => remove(i)}
                        className="px-2 py-1.5 text-sm rounded border border-[var(--border)] text-[var(--text)] hover:text-red-500 hover:border-red-400 transition-colors"
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
    );
}
