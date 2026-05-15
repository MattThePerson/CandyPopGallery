import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListEditor from "../components/ListEditor";

export default function Setup() {
    const navigate = useNavigate();
    const [mediaDirs, setMediaDirs] = useState<string[]>([]);
    const [formats, setFormats] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        console.log('fetching config')
        fetch("/admin/config")
            .then((r) => r.json())
            .then((cfg) => {
                console.log("fetched_config:", cfg);
                setMediaDirs(cfg.media_dirs ?? []);
                setFormats(cfg.filename_formats ?? []);
            })
            .catch(() => {});
    }, []);

    async function handleSubmit() {
        const msg = JSON.stringify({
            media_dirs: mediaDirs,
            filename_formats: formats,
        })
        console.log('submitting:', msg)
        setError(null);
        setSubmitting(true);
        try {
            const res = await fetch("/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: msg,
            });
            if (res.ok) {
                navigate("/");
            } else {
                const text = await res.text();
                setError(text || "Something went wrong.");
            }
        } catch {
            setError("Could not reach the server.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg)]">
            <div className="w-full max-w-xl flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-medium text-[var(--text-h)]">
                        Setup
                    </h1>
                    <p className="text-sm text-[var(--text)] mt-1">
                        Configure your media sources to get started.
                    </p>
                </div>

                <ListEditor
                    label="Media Directories"
                    items={mediaDirs}
                    onChange={setMediaDirs}
                    placeholder="/path/to/media"
                />

                <ListEditor
                    label="Filename Formats"
                    items={formats}
                    onChange={setFormats}
                    placeholder="filename format"
                />

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="self-end px-5 py-2 rounded bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {submitting ? "Saving..." : "Done"}
                </button>
            </div>
        </div>
    );
}
