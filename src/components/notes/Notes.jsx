import { useEffect, useRef, useState, useMemo } from "react"

const NOTES_STORAGE_KEY = "workspace-notes"

const Notes = () => {
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false);

  const textareaRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const savingIndicatorRef = useRef(null)
  const hasLoadedRef = useRef(false)
  const lastSavedRef = useRef("")

  useEffect(() => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY))

      if (storedNotes?.content) {
        setContent(storedNotes.content)
        lastSavedRef.current = storedNotes.content
      }
    } catch (error) {
      console.warn("Error loading stored notes. ", error);
    }

    hasLoadedRef.current = true
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!hasLoadedRef.current) return
    if (content === lastSavedRef.current) return

    clearTimeout(saveTimeoutRef.current)

    saveTimeoutRef.current = setTimeout(() => {
      saveNotes(content)
    }, 800)

    return () => clearTimeout(saveTimeoutRef.current)
  }, [content])

  function saveNotes(value) {
    const data = {
      id: 'notes',
      content: value,
      updatedAt: Date.now()
    }

    setIsSaving(true)

    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(data))
    lastSavedRef.current = value

    clearTimeout(savingIndicatorRef.current)

    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 600);
  }

  function handleBlur() {
    clearTimeout(saveTimeoutRef.current)
    if (content !== lastSavedRef.current) {
      saveNotes(content)
    }
  }

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0
  }, [content])

  return (
    <div className="h-full w-full flex flex-col">
      <textarea
        ref={textareaRef}
        aria-label='Notes Editor'
        placeholder='Write freely… ideas, thoughts, notes from focus session.'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        rows={10}
        className="flex-1 w-full resize-none bg-transparent text-sm outline-none leading-relaxed text-white placeholder:text-white/50 font-mono"
      />

      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-xs text-white/70">
        <div className="flex gap-4">
          <span>Words: {wordCount}</span>
          <span>Chars: {content.length}</span>
        </div>
        <span className="animate-pulse">{isSaving ? "Saving..." : "Saved"}</span>
      </div>
    </div>
  )
}

export default Notes