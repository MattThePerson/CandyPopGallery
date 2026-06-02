import { useEffect, useState, useRef } from 'react'
import { useNavigate, useRouteLoaderData } from 'react-router-dom'
import ListEditor from '../../components/ListEditor'

export default function Configure() {
  const navigate = useNavigate()
  const loaderData = useRouteLoaderData<{ done: boolean }>('root')
  const isInitialSetup = loaderData?.done === false

  const [mediaDirs, setMediaDirs]   = useState<string[]>([])
  const [formats, setFormats]       = useState<string[]>([])
  const [appDataPath, setAppDataPath] = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState<string | null>(null)
  const [saved, setSaved]           = useState(false)
  const [copied, setCopied]         = useState(false)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetch('/admin/config')
      .then(r => r.json())
      .then(cfg => {
        setMediaDirs(cfg.media_dirs ?? [])
        setFormats(cfg.filename_formats ?? [])
      })
      .catch(() => {})

    fetch('/admin/appdata-path')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.path) setAppDataPath(data.path) })
      .catch(() => {})
  }, [])

  async function handleSave() {
    setSaveError(null)

    const cleanedDirs    = mediaDirs.map(s => s.trim()).filter(Boolean)
    const cleanedFormats = formats.map(s => s.trim()).filter(Boolean)

    if (cleanedDirs.length === 0) {
      setSaveError('At least one media folder is required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_dirs: cleanedDirs, filename_formats: cleanedFormats }),
      })
      if (res.ok) {
        if (savedTimer.current) clearTimeout(savedTimer.current)
        setSaved(true)
        savedTimer.current = setTimeout(() => setSaved(false), 2000)
        if (isInitialSetup) navigate('/')
      } else {
        setSaveError(await res.text() || 'Something went wrong.')
      }
    } catch {
      setSaveError('Could not reach the server.')
    } finally {
      setSaving(false)
    }
  }

  function handleCopy() {
    if (!appDataPath) return
    navigator.clipboard.writeText(appDataPath).then(() => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      setCopied(true)
      copiedTimer.current = setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Initial setup banner */}
      {isInitialSetup && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border text-[13px] leading-relaxed"
          style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.30)' }}
        >
          <span className="text-base flex-shrink-0 mt-px text-[var(--info)]">ⓘ</span>
          <p className="text-[var(--text)]">
            Initial configuration — add at least one media folder to get started.
          </p>
        </div>
      )}

      {/* App data path */}
      {appDataPath !== null && (
        <section className="flex flex-col gap-3 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
          <h2 className="text-[13px] font-semibold text-[var(--text-h)]">App Data Folder</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={appDataPath}
              className="flex-1 px-3 py-1.5 rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-sm rounded border border-[var(--border)] text-[var(--text)] hover:text-[var(--text-h)] hover:border-[var(--text)] transition-colors whitespace-nowrap"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </section>
      )}

      {/* Media folders */}
      <section className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
        <h2 className="text-[13px] font-semibold text-[var(--text-h)]">Media Folders</h2>
        <ListEditor
          label=""
          items={mediaDirs}
          onChange={(dirs) => { setMediaDirs(dirs); setSaveError(null) }}
          placeholder="/path/to/media"
          reorderable
        />
        {saveError && saveError.includes('folder') && (
          <p className="text-[12px] text-[var(--err)]">{saveError}</p>
        )}
      </section>

      {/* Filename formats */}
      <section className="flex flex-col gap-4 p-5 rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
        <h2 className="text-[13px] font-semibold text-[var(--text-h)]">Filename Formats</h2>
        <p className="text-[12px] text-[var(--text)] -mt-2">
          Ordered list of patterns used to extract metadata from filenames.
        </p>
        <ListEditor
          label=""
          items={formats}
          onChange={setFormats}
          placeholder="{source}/{community}/[{date_uploaded}] {title} [{source_id:S}].{ext}"
          reorderable
        />
      </section>

      {/* Save row */}
      <div className="flex items-center justify-end gap-3">
        {saveError && !saveError.includes('folder') && (
          <p className="text-[12px] text-[var(--err)] flex-1">{saveError}</p>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

    </div>
  )
}
