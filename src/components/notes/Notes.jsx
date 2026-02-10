import { useEffect, useRef, useState } from "react"

const NOTES_STORAGE_KEY = "workspace-notes"

const Notes = () => {
  const [content, setContent] = useState("")
  const textareaRef = useRef(null)
  const saveTimeoutRef = useRef(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    try {
      const storedNotes = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY))
      if (storedNotes?.content) {
        setContent(storedNotes.content)
      }
    } catch (error) {
      console.warn("Error loading stored notes. ", error);
    }

    hasLoadedRef.current = true
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!hasLoadedRef.current) return

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

    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(data))
  }

  function handleBlur() {
    clearTimeout(saveTimeoutRef.current)
    saveNotes(content)
  }

  return (
    <div className="h-full w-full">
      <textarea
        ref={textareaRef}
        aria-label='Notes Editor'
        placeholder='Write freely… ideas, thoughts, notes from focus session.'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={handleBlur}
        rows={10}
        className="h-full w-full resize-none bg-transparent text-sm outline-none leading-relaxed text-white placeholder:text-white/50"
      />
    </div>
  )
}

export default Notes