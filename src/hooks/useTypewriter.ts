import { useState, useEffect } from 'react'

type Phase = 'typing' | 'pausing' | 'deleting'

interface UseTypewriterOptions {
  typingSpeed?: number
  deletingSpeed?: number
  pauseTime?: number
}

export function useTypewriter(
  words: string[],
  { typingSpeed = 75, deletingSpeed = 35, pauseTime = 2200 }: UseTypewriterOptions = {}
) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    const currentWord = words[wordIndex]

    if (phase === 'typing') {
      if (displayText.length < currentWord.length) {
        const t = setTimeout(
          () => setDisplayText(currentWord.slice(0, displayText.length + 1)),
          typingSpeed
        )
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setPhase('deleting'), pauseTime)
      return () => clearTimeout(t)
    }

    if (phase === 'deleting') {
      if (displayText.length > 0) {
        const t = setTimeout(
          () => setDisplayText(displayText.slice(0, -1)),
          deletingSpeed
        )
        return () => clearTimeout(t)
      }
      setWordIndex((i) => (i + 1) % words.length)
      setPhase('typing')
    }
  }, [displayText, phase, wordIndex, words, typingSpeed, deletingSpeed, pauseTime])

  return { displayText, phase }
}
