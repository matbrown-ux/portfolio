import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { uniqueSlug } from './chapters'

export interface ChapterEntry {
  id: string
  title: string
  el: HTMLElement
}

export interface ChapterRegistry {
  /** Registers a chapter and returns its unique id (dedupes repeated titles). */
  register(base: string, title: string, el: HTMLElement): string
  unregister(id: string): void
}

// Split contexts: the registry is stable, so registering never re-runs Chapter effects.
const RegistryContext = createContext<ChapterRegistry | null>(null)
const ChaptersContext = createContext<ChapterEntry[]>([])

function byDocumentOrder(a: ChapterEntry, b: ChapterEntry) {
  return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

export function ChapterProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<ChapterEntry[]>([])
  const taken = useRef(new Set<string>())

  const register = useCallback((base: string, title: string, el: HTMLElement) => {
    const id = uniqueSlug(base, taken.current)
    taken.current.add(id)
    setChapters((prev) => [...prev, { id, title, el }].sort(byDocumentOrder))
    return id
  }, [])

  const unregister = useCallback((id: string) => {
    taken.current.delete(id)
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const registry = useMemo(() => ({ register, unregister }), [register, unregister])

  return (
    <RegistryContext.Provider value={registry}>
      <ChaptersContext.Provider value={chapters}>{children}</ChaptersContext.Provider>
    </RegistryContext.Provider>
  )
}

export const useChapterRegistry = () => useContext(RegistryContext)
export const useChapters = () => useContext(ChaptersContext)
