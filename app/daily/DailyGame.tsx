'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import styles from './daily.module.css'
import { CLUE_LABELS, getClueValue, ALL_TEAMS, type TeamData } from '@/lib/teamData'

const MAX_CLUES = 6

function buildShareText(wrongGuesses: string[], solved: boolean, num: number): string {
  let emoji = ''
  for (let i = 0; i < MAX_CLUES; i++) {
    if (i < wrongGuesses.length) emoji += '🟥'
    else if (i === wrongGuesses.length && solved) emoji += '🟩'
    else emoji += '⬛'
  }
  return `The Daily Grind #${num}\n${emoji}\nstatgrinder.com/daily`
}

interface SavedState {
  cluesRevealed: number
  solved: boolean
  failed: boolean
  wrongGuesses: string[]
}

interface Props {
  team: TeamData
  challengeNum: number
}

export default function DailyGame({ team, challengeNum }: Props) {
  const storageKey = `sg_daily_${challengeNum}_${team.abbrev}_${team.league}`

  const [cluesRevealed, setCluesRevealed] = useState(1)
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function clearInput() {
    setQuery('')
    setDropdownOpen(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  function selectTeam(t: TeamData) {
    if (inputRef.current) inputRef.current.value = t.name
    setQuery(t.name)
    setDropdownOpen(false)
    setHighlightedIdx(-1)
    inputRef.current?.focus()
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const s = JSON.parse(raw) as SavedState
        setCluesRevealed(Math.max(1, s.cluesRevealed))
        setSolved(s.solved)
        setFailed(s.failed)
        setWrongGuesses(s.wrongGuesses ?? [])
      }
    } catch { /* ignore */ }
  }, [storageKey])

  function persist(cr: number, sv: boolean, fa: boolean, wg: string[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ cluesRevealed: cr, solved: sv, failed: fa, wrongGuesses: wg }))
    } catch { /* ignore */ }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return ALL_TEAMS.filter(t => t.name.toLowerCase().includes(q)).slice(0, 8)
  }, [query])

  useEffect(() => setHighlightedIdx(-1), [query])

  function submitGuess(guessedTeam?: TeamData) {
    const name = guessedTeam?.name ?? query.trim()
    if (!name) return
    clearInput()
    setHighlightedIdx(-1)

    if (name.toLowerCase() === team.name.toLowerCase()) {
      setSolved(true)
      persist(cluesRevealed, true, false, wrongGuesses)
    } else {
      const wg = [...wrongGuesses, name]
      setWrongGuesses(wg)
      if (wg.length >= MAX_CLUES) {
        setFailed(true)
        persist(MAX_CLUES, false, true, wg)
      } else {
        const next = wg.length + 1
        setCluesRevealed(next)
        persist(next, false, false, wg)
        setTimeout(() => inputRef.current?.focus(), 80)
      }
    }
  }

  function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => execCopy(text))
      return
    }
    execCopy(text)
  }

  function execCopy(text: string) {
    const el = document.createElement('textarea')
    el.value = text
    el.setAttribute('readonly', '')
    el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'
    document.body.appendChild(el)
    el.focus()
    el.select()
    el.setSelectionRange(0, el.value.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(el)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function share() {
    const text = buildShareText(wrongGuesses, solved, challengeNum)

    // 1. Native WKWebView bridge (iOS app wrapper)
    const webkit = (window as any).webkit
    if (webkit?.messageHandlers?.nativeShare) {
      webkit.messageHandlers.nativeShare.postMessage(text)
      return
    }

    // 2. Web Share API (Safari on iOS)
    if (typeof navigator.share === 'function') {
      navigator.share({ title: 'The Daily Grind', text }).catch((err: any) => {
        if (err?.name !== 'AbortError') setShareOpen(true)
      })
      return
    }

    // 3. Custom share sheet (Chrome on iOS, desktop)
    setShareOpen(true)
  }

  const done = solved || failed
  const totalGuesses = wrongGuesses.length + (solved ? 1 : 0)
  const shareText = buildShareText(wrongGuesses, solved, challengeNum)
  const shareEmoji = shareText.split('\n')[1]
  const showDropdown = dropdownOpen && filtered.length > 0
  const encodedText = encodeURIComponent(shareText)

  return (
    <div className={styles.page}>
      <div className={styles.app}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.challengeNum}>
            The Daily Grind for{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <Link href="/" className={styles.backLink}>← All modes</Link>
        </div>

        {/* Clue cards */}
        <div className={styles.clueList}>
          {Array.from({ length: cluesRevealed }, (_, i) => {
            const isCorrect = solved && i === wrongGuesses.length
            return (
              <div
                key={i}
                className={`${styles.clueCard} ${isCorrect ? styles.clueCardCorrect : ''}`}
              >
                <div className={styles.clueRow}>
                  <span className={styles.clueLabel}>{CLUE_LABELS[i]}</span>
                  {i === 5 ? (
                    <div className={styles.colorSwatches}>
                      {team.colors.map(c => (
                        <div key={c} className={styles.colorSwatch} style={{ background: c }} title={c} />
                      ))}
                    </div>
                  ) : (
                    <span className={styles.clueValue}>{getClueValue(team, i)}</span>
                  )}
                </div>
                {wrongGuesses[i] && (
                  <div className={styles.clueWrong}>✗ {wrongGuesses[i]}</div>
                )}
                {isCorrect && (
                  <div className={styles.clueCorrect}>✓ {team.name}</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Guess input */}
        {!done && (
          <div className={styles.searchWrap}>
            <div className={styles.inputRow}>
              <div className={styles.inputWrap}>
                <input
                  ref={inputRef}
                  type="text"
                  className={styles.input}
                  placeholder="Search all 124 teams…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  onChange={e => { setQuery(e.target.value); setDropdownOpen(true) }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      setHighlightedIdx(i => Math.min(i + 1, filtered.length - 1))
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      setHighlightedIdx(i => Math.max(i - 1, 0))
                    } else if (e.key === 'Enter') {
                      const target = highlightedIdx >= 0 ? filtered[highlightedIdx] : filtered[0]
                      if (target) submitGuess(target)
                    } else if (e.key === 'Escape') {
                      clearInput()
                    }
                  }}
                />
                {showDropdown && (
                  <ul className={styles.dropdown}>
                    {filtered.map((t, i) => (
                      <li
                        key={`${t.abbrev}-${t.league}`}
                        className={`${styles.dropdownItem} ${i === highlightedIdx ? styles.dropdownItemActive : ''}`}
                        onClick={() => selectTeam(t)}
                        onMouseEnter={() => setHighlightedIdx(i)}
                      >
                        <span className={styles.dropdownName}>{t.name}</span>
                        <span className={styles.dropdownLeague}>{t.league}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className={styles.guessBtn}
                onClick={() => submitGuess()}
                disabled={!query.trim()}
              >
                Guess
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {done && (
          <div className={styles.result}>
            {solved ? (
              <>
                <div className={styles.resultScore}>{totalGuesses}</div>
                <div className={styles.resultLabel}>
                  {`you got it in ${totalGuesses} ${totalGuesses === 1 ? 'guess' : 'guesses'}`}
                </div>
              </>
            ) : (
              <>
                <div className={`${styles.resultScore} ${styles.resultScoreFail}`}>—</div>
                <div className={styles.resultLabel}>better luck tomorrow</div>
              </>
            )}

            <div className={styles.resultTeam}>{team.name}</div>
            <div className={styles.resultMeta}>{team.league} · {team.venueName}</div>

            <div className={styles.shareEmoji}>{shareEmoji}</div>

            <button className={styles.shareBtn} onClick={share}>
              Share result
            </button>

            <div className={styles.nextChallenge}>Grind again tomorrow</div>
          </div>
        )}

        {/* Progress pips */}
        <div className={styles.progress}>
          {Array.from({ length: MAX_CLUES }, (_, i) => {
            if (solved && i === wrongGuesses.length) return <div key={i} className={styles.pipCorrect} />
            if (i < wrongGuesses.length) return <div key={i} className={styles.pipUsed} />
            if (i === wrongGuesses.length && !done) return <div key={i} className={styles.pipActive} />
            return <div key={i} className={styles.pip} />
          })}
        </div>

      </div>

      {/* Custom share sheet */}
      {shareOpen && (
        <div className={styles.shareOverlay} onClick={() => setShareOpen(false)}>
          <div className={styles.shareSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.shareHandle} />
            <div className={styles.sharePreview}>{shareText}</div>
            <div className={styles.shareActions}>
              <a
                className={styles.shareAction}
                href={`sms:&body=${encodedText}`}
                onClick={() => setShareOpen(false)}
              >
                <span className={styles.shareActionIcon}>💬</span>
                <span className={styles.shareActionLabel}>Messages</span>
              </a>
              <a
                className={styles.shareAction}
                href={`mailto:?subject=The%20Daily%20Grind&body=${encodedText}`}
                onClick={() => setShareOpen(false)}
              >
                <span className={styles.shareActionIcon}>✉️</span>
                <span className={styles.shareActionLabel}>Mail</span>
              </a>
              <button
                className={styles.shareAction}
                onClick={() => { copyText(shareText); setShareOpen(false) }}
              >
                <span className={styles.shareActionIcon}>📋</span>
                <span className={styles.shareActionLabel}>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <button className={styles.shareCancel} onClick={() => setShareOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
